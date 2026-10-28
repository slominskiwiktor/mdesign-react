import { markdownFiles, brokenDocumentationLinks } from './documentation-links.mjs';

const root = process.cwd();
const files = [
  'README.md',
  'CHANGELOG.md',
  'THIRD_PARTY_NOTICES.md',
  'SECURITY.md',
  'CONTRIBUTING.md',
  'CODE_OF_CONDUCT.md',
  'src/kit/mobile/README.md',
  ...(await markdownFiles(root, 'docs')),
  ...(await markdownFiles(root, 'src/storybook-pages')),
];
const failures = await brokenDocumentationLinks(root, files);
if (failures.length) throw new Error(`Broken documentation links:\n${failures.join('\n')}`);
console.log(`Checked relative links in ${files.length} Markdown/MDX files.`);
