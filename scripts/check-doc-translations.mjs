#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const contentRoot = path.join(repoRoot, 'content');
const publicArg = process.argv.indexOf('--public');
const publicRoot =
  publicArg === -1 ? null : path.resolve(process.argv[publicArg + 1] ?? '');

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const item = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(item) : [item];
  });
}

function headings(markdown) {
  let fence = null;
  const result = [];

  for (const line of markdown.split('\n')) {
    const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/);
    if (fenceMatch) {
      const marker = fenceMatch[1];
      if (!fence) fence = marker;
      else if (fence[0] === marker[0] && marker.length >= fence.length) {
        fence = null;
      }
      continue;
    }
    if (fence) continue;

    const match = line.match(/^(#{2,6})\s+(.+?)\s*$/);
    if (!match) continue;
    const anchor = match[2].match(/\s+\{#([^}]+)\}\s*$/)?.[1] ?? null;
    result.push({ level: match[1].length, text: match[2], anchor });
  }

  return result;
}

function outputPath(source, language = null) {
  const relative = path
    .relative(contentRoot, source)
    .replace(/\.en\.md$/, '')
    .replace(/\.md$/, '');
  const parts = relative.split(path.sep);
  if (parts.at(-1) === 'index' || parts.at(-1) === '_index') parts.pop();
  const root = language ? path.join(publicRoot, language) : publicRoot;
  return path.join(root, ...parts, 'index.html');
}

function renderedHeadingIds(file) {
  const html = readFileSync(file, 'utf8');
  return [...html.matchAll(/<h([2-6])\b[^>]*\bid=(?:"([^"]+)"|'([^']+)'|([^\s>]+))/g)].map(
    ([, level, doubleQuoted, singleQuoted, unquoted]) =>
      `${level}:${doubleQuoted ?? singleQuoted ?? unquoted}`,
  );
}

const requiredPairs = [
  '_index.md',
  'blog/_index.md',
  'experience/_index.md',
  'learn/_index.md',
  'links.md',
  'search.md',
];
const sources = walk(contentRoot)
  .filter((file) => file.endsWith('.en.md'))
  .sort();
const errors = [];
let translated = 0;
let headingCount = 0;

for (const relative of requiredPairs) {
  const source = path.join(contentRoot, relative);
  const target = source.replace(/\.md$/, '.en.md');
  if (!existsSync(source)) errors.push(`content/${relative}: Chinese source is missing`);
  if (!existsSync(target)) errors.push(`content/${relative}: English peer is missing`);
}

for (const target of sources) {
  const relative = path.relative(repoRoot, target);
  const source = target.replace(/\.en\.md$/, '.md');
  if (!existsSync(source)) {
    errors.push(`${relative}: missing Chinese source ${path.basename(source)}`);
    continue;
  }

  translated += 1;
  const sourceHeadings = headings(readFileSync(source, 'utf8'));
  const targetHeadings = headings(readFileSync(target, 'utf8'));
  headingCount += sourceHeadings.length;

  if (sourceHeadings.length !== targetHeadings.length) {
    errors.push(
      `${relative}: heading count ${sourceHeadings.length} != ${targetHeadings.length}`,
    );
  }

  const anchors = new Set();
  for (const [index, heading] of targetHeadings.entries()) {
    if (!heading.anchor) {
      errors.push(
        `${relative}: English heading ${index + 1} has no explicit ID`,
      );
    } else if (anchors.has(heading.anchor)) {
      errors.push(
        `${relative}: duplicate translated heading ID #${heading.anchor}`,
      );
    } else {
      anchors.add(heading.anchor);
    }
  }

  if (!publicRoot || source.includes(`${path.sep}includes${path.sep}`))
    continue;
  const sourceOutput = outputPath(source);
  const targetOutput = outputPath(target, 'en');
  if (!existsSync(sourceOutput) || !existsSync(targetOutput)) {
    errors.push(`${relative}: rendered Chinese or English page is missing`);
    continue;
  }

  const sourceIds = renderedHeadingIds(sourceOutput);
  const targetIds = renderedHeadingIds(targetOutput);
  if (targetIds.length < targetHeadings.length) {
    errors.push(
      `${relative}: fewer rendered heading IDs than source headings`,
    );
  }
  if (JSON.stringify(sourceIds) !== JSON.stringify(targetIds)) {
    errors.push(`${relative}: rendered heading IDs differ between zh and en`);
  }
}

console.log(
  `English translation coverage: ${translated}/${sources.length} files; ${headingCount} source headings checked.`,
);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
}
