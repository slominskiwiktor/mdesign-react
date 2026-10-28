import type { ReactNode } from 'react';
import { ExampleRenderer, getExample } from '../stories/registry';
import type { ExampleArgs } from '../stories/registry';
import '../../.storybook/preview';

export function BrowserExample({
  name,
  args,
  theme = 'light',
  corePlatform = 'web',
}: {
  name: string;
  args?: ExampleArgs;
  theme?: 'light' | 'dark';
  corePlatform?: 'web' | 'mobile';
}) {
  const category = getExample(name).category;
  return (
    <BrowserSurface
      platform={
        category === 'mobile'
          ? 'mobile'
          : category === 'landing'
            ? 'landing'
            : category === 'core'
              ? corePlatform
              : 'web'
      }
      theme={theme}
    >
      <ExampleRenderer name={name} args={args} />
    </BrowserSurface>
  );
}
export function BrowserSurface({
  children,
  platform = 'web',
  theme = 'light',
}: {
  children: ReactNode;
  platform?: string;
  theme?: 'light' | 'dark';
}) {
  return (
    <div
      data-testid="visual-root"
      className="md-story-surface"
      data-platform={platform}
      data-theme={theme}
    >
      {children}
    </div>
  );
}
