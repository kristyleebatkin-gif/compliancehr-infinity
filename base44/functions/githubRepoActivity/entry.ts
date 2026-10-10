import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const DEFAULT_REPO = 'kristyleebatkin-gif/ComplianceHRLatestVersion';

const eventText = (e) => {
  const actor = e.actor ? e.actor.login : 'someone';
  const p = e.payload || {};
  switch (e.type) {
    case 'PushEvent': {
      const size = p.size || (p.commits ? p.commits.length : 0);
      return `${actor} pushed ${size} commit${size === 1 ? '' : 's'}`;
    }
    case 'PullRequestEvent':
      return `${actor} ${p.action || 'updated'} pull request #${p.pull_request ? p.pull_request.number : ''}`;
    case 'IssuesEvent':
      return `${actor} ${p.action || 'updated'} issue #${p.issue ? p.issue.number : ''}`;
    case 'IssueCommentEvent':
      return `${actor} commented on issue #${p.issue ? p.issue.number : ''}`;
    case 'PullRequestReviewEvent':
      return `${actor} reviewed pull request #${p.pull_request ? p.pull_request.number : ''}`;
    case 'PullRequestReviewCommentEvent':
      return `${actor} commented on pull request #${p.pull_request ? p.pull_request.number : ''}`;
    case 'CreateEvent':
      return `${actor} created ${p.ref_type || 'ref'} ${p.ref || ''}`.trim();
    case 'DeleteEvent':
      return `${actor} deleted ${p.ref_type || 'ref'} ${p.ref || ''}`.trim();
    case 'WatchEvent':
      return `${actor} starred the repository`;
    case 'ForkEvent':
      return `${actor} forked the repository`;
    case 'ReleaseEvent':
      return `${actor} released ${p.release ? p.release.tag_name : ''}`.trim();
    default:
      return `${actor} did ${e.type ? e.type.replace(/Event$/, '') : 'something'}`;
  }
};

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let repoFull = DEFAULT_REPO;
    try {
      const body = await req.json();
      if (body && typeof body.repo === 'string' && body.repo.trim()) {
        repoFull = body.repo.trim();
      }
    } catch (e) {
      // no/empty body: use default repo
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('github');
    if (!accessToken) {
      return Response.json({ error: 'GitHub is not connected' }, { status: 400 });
    }

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'compliancehr-portal',
    };

    const call = async (path) => {
      const res = await fetch(`https://api.github.com${path}`, { headers, signal: AbortSignal.timeout(10000) });
      if (!res.ok) {
        let detail = '';
        try {
          detail = (await res.json()).message;
        } catch (e) {}
        throw new Error(`GitHub request failed (${res.status}): ${detail}`);
      }
      return res;
    };
    const json = async (path) => (await call(path)).json();

    const [repo, commitsCountRes, pulls, issuesRaw, events] = await Promise.all([
      json(`/repos/${repoFull}`),
      call(`/repos/${repoFull}/commits?per_page=1`),
      json(`/repos/${repoFull}/pulls?state=open&per_page=10`),
      json(`/repos/${repoFull}/issues?state=open&per_page=10`),
      json(`/repos/${repoFull}/events?per_page=25`),
    ]);

    // Total commits from the pagination "last" page header
    let totalCommits = 0;
    const link = commitsCountRes.headers.get('link');
    const match = link ? link.match(/[?&]page=(\d+)[^>]*>; rel="last"/) : null;
    if (match) {
      totalCommits = parseInt(match[1], 10);
    } else {
      const onlyPage = await commitsCountRes.json();
      totalCommits = onlyPage.length;
    }

    const commits = await json(`/repos/${repoFull}/commits?per_page=10`);
    const issues = issuesRaw.filter((i) => !i.pull_request).slice(0, 10);

    return Response.json({
      repo: {
        full_name: repo.full_name,
        description: repo.description,
        html_url: repo.html_url,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        watchers: repo.subscribers_count,
        open_issues: repo.open_issues_count,
        language: repo.language,
        default_branch: repo.default_branch,
        private: repo.private,
        created_at: repo.created_at,
        pushed_at: repo.pushed_at,
      },
      total_commits: totalCommits,
      commits: commits.map((c) => ({
        sha: (c.sha || '').slice(0, 7),
        message: c.commit && c.commit.message ? c.commit.message.split('\n')[0] : '',
        author: c.commit && c.commit.author ? c.commit.author.name : '',
        date: c.commit && c.commit.author ? c.commit.author.date : null,
        url: c.html_url,
      })),
      pulls: pulls.map((p) => ({
        number: p.number,
        title: p.title,
        user: p.user ? p.user.login : '',
        created_at: p.created_at,
        url: p.html_url,
      })),
      issues: issues.map((i) => ({
        number: i.number,
        title: i.title,
        user: i.user ? i.user.login : '',
        created_at: i.created_at,
        url: i.html_url,
      })),
      events: events.map((e) => ({ type: e.type, text: eventText(e), date: e.created_at })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}