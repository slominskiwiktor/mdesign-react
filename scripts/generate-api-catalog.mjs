import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
import { describeApiProp, literalOptions, validateApiDescriptions } from './api-descriptions.mjs';
const config = ts.readConfigFile('tsconfig.lib.json', ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, '.');
const program = ts.createProgram(parsed.fileNames, parsed.options),
  checker = program.getTypeChecker();
const source = program.getSourceFile('src/kit/index.ts'),
  symbol = checker.getSymbolAtLocation(source);
const components = [];
for (const exported of checker.getExportsOfModule(symbol)) {
  const resolved =
    exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
  const name = exported.getName();
  if (!/^[A-Z]/.test(name) || !(resolved.flags & ts.SymbolFlags.Value) || name === 'DialogClose')
    continue;
  const declaration = resolved.getDeclarations()?.[0];
  if (!declaration) continue;
  const type = checker.getTypeOfSymbolAtLocation(resolved, declaration);
  const signature = checker.getSignaturesOfType(type, ts.SignatureKind.Call)[0];
  if (!signature) continue;
  const returns = checker.typeToString(checker.getReturnTypeOfSignature(signature));
  if (!/Element|ReactNode|ReactPortal/.test(returns)) continue;
  const file = path
    .relative(process.cwd(), declaration.getSourceFile().fileName)
    .replaceAll('\\', '/');
  const category =
    ['portal', 'mobile', 'landing'].find((part) => file.includes(`/kit/${part}/`)) ?? 'core';
  const param = signature.getParameters()[0];
  const props = param
    ? checker
        .getPropertiesOfType(checker.getTypeOfSymbolAtLocation(param, declaration))
        .flatMap((p) => {
          const defs = p.getDeclarations() ?? [];
          if (!defs.some((d) => d.getSourceFile().fileName.includes('/kit/'))) return [];
          const propertyType = checker.getTypeOfSymbolAtLocation(p, declaration);
          const options = literalOptions(propertyType, checker);
          return [
            {
              name: p.getName(),
              type: checker.typeToString(propertyType),
              required: !(p.flags & ts.SymbolFlags.Optional),
              description: describeApiProp(name, p.getName(), {
                documentation: ts.displayPartsToString(p.getDocumentationComment(checker)),
              }),
              ...(options ? { options } : {}),
            },
          ];
        })
    : [];
  components.push({ name, category, file, props });
}
components.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
validateApiDescriptions(components);
const version = JSON.parse(fs.readFileSync('package.json', 'utf8')).version;
const counts = Object.fromEntries(
  ['core', 'portal', 'mobile', 'landing'].map((c) => [
    c,
    components.filter((v) => v.category === c).length,
  ]),
);
const data = { version, componentCount: components.length, counts, components };
fs.writeFileSync('src/catalog/component-manifest.json', JSON.stringify(data, null, 2) + '\n');
console.log(JSON.stringify({ version, componentCount: components.length, counts }));
