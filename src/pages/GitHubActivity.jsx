import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Star, GitFork, Eye, CircleDot, GitPullRequest, GitBranch,
  RefreshCw, ExternalLink, Github, Activity, GitCommitHorizontal,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const StatCard = ({ icon: Icon, label, value }) => (
  <Card>
    <CardContent className="flex items-center gap-3 p-4">
      <div className="rounded-lg bg-muted p-2">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </CardContent>
  </Card>
);

export default function GitHubActivity() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('githubRepoActivity', {});
      setData(res.data);
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Failed to load GitHub data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <Github className="h-10 w-10 text-muted-foreground" />
        <p className="text-lg font-medium">Could not load GitHub data</p>
        <p className="max-w-md text-sm text-muted-foreground">{error}</p>
        <Button onClick={fetchData}>
          <RefreshCw className="mr-2 h-4 w-4" /> Try again
        </Button>
      </div>
    );
  }

  const { repo, total_commits, commits, pulls, issues, events } = data;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-muted p-3">
            <Github className="h-7 w-7" />
          </div>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              {repo.full_name}
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                {repo.private ? 'Private' : 'Public'}
              </span>
            </h1>
            <p className="text-sm text-muted-foreground">{repo.description || 'No description'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button asChild>
            <a href={repo.html_url} target="_blank" rel="noreferrer">
              View on GitHub <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard icon={Star} label="Stars" value={repo.stars} />
        <StatCard icon={GitFork} label="Forks" value={repo.forks} />
        <StatCard icon={Eye} label="Watchers" value={repo.watchers} />
        <StatCard icon={CircleDot} label="Open issues" value={repo.open_issues} />
        <StatCard icon={GitPullRequest} label="Open PRs" value={pulls.length} />
        <StatCard icon={GitCommitHorizontal} label="Commits" value={total_commits} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <GitBranch className="h-5 w-5" /> Recent commits
              <span className="text-sm font-normal text-muted-foreground">({repo.default_branch})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {commits.length === 0 && <p className="text-sm text-muted-foreground">No commits yet.</p>}
            {commits.map((c) => (
              <a
                key={c.sha}
                href={c.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <p className="truncate text-sm font-medium">{c.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  <span className="font-mono">{c.sha}</span> · {c.author} ·{' '}
                  {c.date ? formatDistanceToNow(new Date(c.date), { addSuffix: true }) : ''}
                </p>
              </a>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5" /> Recent activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {events.length === 0 && <p className="text-sm text-muted-foreground">No recent activity.</p>}
            {events.slice(0, 10).map((e, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary"></div>
                <div>
                  <p className="text-sm">{e.text}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.date ? formatDistanceToNow(new Date(e.date), { addSuffix: true }) : ''}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {(pulls.length > 0 || issues.length > 0) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {pulls.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <GitPullRequest className="h-5 w-5" /> Open pull requests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pulls.map((p) => (
                  <a
                    key={p.number}
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <p className="truncate text-sm font-medium">#{p.number} {p.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.user} · {p.created_at ? formatDistanceToNow(new Date(p.created_at), { addSuffix: true }) : ''}
                    </p>
                  </a>
                ))}
              </CardContent>
            </Card>
          )}
          {issues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CircleDot className="h-5 w-5" /> Open issues
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {issues.map((i) => (
                  <a
                    key={i.number}
                    href={i.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <p className="truncate text-sm font-medium">#{i.number} {i.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {i.user} · {i.created_at ? formatDistanceToNow(new Date(i.created_at), { addSuffix: true }) : ''}
                    </p>
                  </a>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}