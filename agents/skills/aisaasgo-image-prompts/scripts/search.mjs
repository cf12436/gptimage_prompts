#!/usr/bin/env node
// Read-only local search; requires Node.js, no dependencies or network.
import { readFile } from 'node:fs/promises';
const { cases } = JSON.parse(await readFile(new URL('../references/cases.json', import.meta.url), 'utf8'));
const args = process.argv.slice(2);
if (!args.length) {
  console.error('Usage: node search.mjs <keywords...> | --id <case-id>');
  process.exitCode = 1;
} else if (args[0] === '--id') {
  const item = args.length === 2 && cases.find(c => c.id === Number(args[1]));
  if (!item) { console.error('Case not found. Choose an ID from the bundled index.'); process.exitCode = 1; }
  else console.log(JSON.stringify(item, null, 2));
} else {
  const terms = args.join(' ').toLocaleLowerCase().split(/\s+/u).filter(Boolean);
  const results = cases.map(c => {
    const title = c.title.toLocaleLowerCase();
    const tags = [c.category, ...c.styles, ...c.scenes].join(' ').toLocaleLowerCase();
    const prompt = c.prompt.toLocaleLowerCase();
    const score = terms.reduce((n, term) => n + (title.includes(term) ? 5 : 0) + (tags.includes(term) ? 3 : 0) + (prompt.includes(term) ? 1 : 0), 0);
    return { c, score };
  }).filter(r => r.score > 0).sort((a, b) => b.score - a.score || b.c.id - a.c.id).slice(0, 10)
    .map(({ c, score }) => ({ id: c.id, title: c.title, category: c.category, styles: c.styles, scenes: c.scenes, sourceLabel: c.sourceLabel, sourceUrl: c.sourceUrl, score }));
  console.log(JSON.stringify(results, null, 2));
}
