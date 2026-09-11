#!/usr/bin/env node
/** Migrate the upstream snapshot without rewriting prompts or source credits.
 * node scripts/migrate-library.mjs /absolute/path/to/awesome-gpt-image-2
 * node scripts/migrate-library.mjs --validate /absolute/path/to/awesome-gpt-image-2
 */
import { readFile, writeFile, mkdir, readdir, copyFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const validateOnly = process.argv.includes('--validate');
const sourceArg = process.argv.slice(2).find(arg => arg !== '--validate');
if (!sourceArg) throw new Error('Provide the upstream repository directory.');
const source = path.resolve(sourceArg);
assert.notEqual(source, root, 'Source must differ from destination');
const repository = 'https://github.com/cf12436/gptimage_prompts';
const upstream = 'https://github.com/freestylefly/awesome-gpt-image-2';
const skill = 'agents/skills/aisaasgo-image-prompts';
const json = async p => JSON.parse(await readFile(p, 'utf8'));
const save = async (p, value) => { await mkdir(path.dirname(p), { recursive: true }); await writeFile(p, typeof value === 'string' ? value : `${JSON.stringify(value, null, 2)}\n`); };
async function files(dir, prefix = '') {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) result.push(...await files(path.join(dir, entry.name), relative));
    else if (entry.isFile()) result.push(relative);
    else throw new Error(`Unsupported source asset: ${relative}`);
  }
  return result.sort();
}
const original = await json(path.join(source, 'data/cases.json'));
const styles = await json(path.join(source, 'data/style-library.json'));
assert.equal(original.cases.length, 541);
assert.equal(original.totalCases, original.cases.length);
const referenced = new Set();
function collectImages(value) {
  if (typeof value === 'string' && value.startsWith('/images/')) {
    const relative = value.slice('/images/'.length);
    assert(relative && !relative.includes('\\') && !relative.split('/').some(part => !part || part === '.' || part === '..'), `Unsafe image path: ${value}`);
    referenced.add(relative);
  } else if (Array.isArray(value)) value.forEach(collectImages);
  else if (value && typeof value === 'object') Object.values(value).forEach(collectImages);
}
collectImages(original); collectImages(styles);
const imageFiles = [...referenced].sort();
const migrated = { ...original, repository, upstreamRepository: original.repository };
const migratedStyles = { ...styles, repository, upstreamRepository: styles.repository, templateDocument: `${upstream}/blob/main/${styles.templateDocument}` };
if (!validateOnly) {
  await save(path.join(root, 'data/cases.json'), migrated);
  await save(path.join(root, 'data/style-library.json'), migratedStyles);
  for (const file of imageFiles) {
    const dest = path.join(root, 'public/images', file);
    await mkdir(path.dirname(dest), { recursive: true });
    await copyFile(path.join(source, 'data/images', file), dest);
  }
  // public/images is the migrated library asset directory. Remove stale,
  // unreferenced assets so subsequent builds cannot publish upstream marketing.
  for (const file of await files(path.join(root, 'public/images'))) {
    if (!referenced.has(file)) await rm(path.join(root, 'public/images', file));
  }
  await copyFile(path.join(source, 'LICENSE'), path.join(root, 'LICENSE'));
  await save(path.join(root, skill, 'references/cases.json'), migrated);
  await save(path.join(root, skill, 'references/style-library.json'), migratedStyles);
  const index = ['# AISaasGo 案例索引', '', '由完整案例库生成。按编号读取同目录 cases.json 中的完整 prompt；不要将标题当作完整提示词。', '来源：freestylefly/awesome-gpt-image-2；保留各案例 sourceLabel、sourceUrl、githubUrl。', ''];
  for (const category of original.categories) {
    index.push(`## ${category}`, '');
    for (const c of original.cases.filter(c => c.category === category)) index.push(`- #${c.id} ${c.title} — ${c.styles.join(', ')} / ${c.scenes.join(', ')}`);
    index.push('');
  }
  await save(path.join(root, skill, 'references/case-index.md'), `${index.join('\n')}\n`);
  await save(path.join(root, skill, 'LICENSE'), await readFile(path.join(source, 'LICENSE'), 'utf8'));
}
const actual = await json(path.join(root, 'data/cases.json'));
assert.deepEqual(actual, migrated, 'Case content or attribution changed');
assert.deepEqual(await json(path.join(root, 'data/style-library.json')), migratedStyles);
assert.deepEqual(await json(path.join(root, skill, 'references/cases.json')), migrated);
assert.deepEqual(await json(path.join(root, skill, 'references/style-library.json')), migratedStyles);
assert.equal(new Set(actual.cases.map(c => c.id)).size, 541, 'Duplicate case IDs');
assert.equal(await readFile(path.join(root, 'LICENSE'), 'utf8'), await readFile(path.join(source, 'LICENSE'), 'utf8'));
assert.deepEqual(await files(path.join(root, 'public/images')), imageFiles, 'Public image scope differs from case/style references');
let totalBytes = 0;
const digest = b => createHash('sha256').update(b).digest('hex');
for (const file of imageFiles) {
  const before = await readFile(path.join(source, 'data/images', file));
  const after = await readFile(path.join(root, 'public/images', file));
  assert.equal(digest(after), digest(before), `Asset hash mismatch: ${file}`);
  totalBytes += after.length;
}
const ids = new Set(actual.cases.map(c => c.id));
for (const template of migratedStyles.templates) for (const id of template.exampleCases ?? []) assert(ids.has(id), `Missing template example ${id}`);
const report = {
  repository, upstreamRepository: upstream,
  cases: actual.cases.length, categories: actual.categories.length,
  templates: migratedStyles.templates.length,
  caseImages: new Set(actual.cases.map(c => c.image)).size,
  referencedImages: referenced.size, migratedImageFiles: imageFiles.length,
  totalImageBytes: totalBytes,
  imageExtensions: Object.fromEntries([...new Set(imageFiles.map(f => path.extname(f)))].map(ext => [ext, imageFiles.filter(f => path.extname(f) === ext).length])),
  missingImages: 0, imageHashMismatches: 0,
  promptsAndSourceAttributionUnchanged: true, skillBundleMatchesLibrary: true,
  upstreamLicenseUnchanged: true
};
if (!validateOnly) await save(path.join(root, 'data/migration-report.json'), report);
console.log(JSON.stringify(report, null, 2));
