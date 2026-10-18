const fs = require('fs');
for (const n of ['Feedback', 'TodoTask']) {
  const p = 'base44/entities/' + n + '.jsonc';
  const t = JSON.parse(fs.readFileSync(p, 'utf8').replace(/\/\/.*/g, ''));
  t.rls.create = {};
  fs.writeFileSync(p, JSON.stringify(t, null, 2));
  console.log(n, 'create -> open, all other rules preserved');
}