import { readdir, readFile, access } from 'node:fs/promises';
import path from 'node:path';

export async function markdownFiles(root, directory) {
  const result = [];
  for (const entry of await readdir(path.join(root, directory), { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...(await markdownFiles(root, file)));
    else if (/\.mdx?$/.test(file)) result.push(file);
  }
  return result;
}

export async function brokenDocumentationLinks(root, files) {
  const failures = [];
  for (const file of files) {
    const text = (await readFile(path.join(root, file), 'utf8')).replace(
      /^(```|~~~)[\s\S]*?^\1.*$/gm,
      '',
    );
    for (const [, href] of text.matchAll(/\]\(([^)\s]+)\)/g)) {
      if (/^(?:[a-z]+:|#|\?)/i.test(href)) continue;
      const target = href.split(/[?#]/)[0];
      if (!target) continue;
      try {
        const destination = path.resolve(root, path.dirname(file), decodeURIComponent(target));
        if (!destination.startsWith(path.resolve(root) + path.sep))
          throw new Error('Link escapes document root');
        await access(destination);
      } catch {
        failures.push(`${file}: ${href}`);
      }
    }
  }
  return failures;
}
