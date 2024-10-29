'use client';

import * as React from 'react';
import {
  FluentProvider,
  webLightTheme,
  SSRProvider,
  RendererProvider,
  createDOMRenderer,
  renderToStyleElements,
} from '@fluentui/react-components';
import { useServerInsertedHTML } from 'next/navigation';

export function Providers({ children }: { children: React.ReactNode }) {
  const [renderer] = React.useState(() => createDOMRenderer());
  const didRenderRef = React.useRef(false);

  useServerInsertedHTML(() => {
    if (didRenderRef.current) {
      return;
    }
    didRenderRef.current = true;
    return <>{renderToStyleElements(renderer)}</>;
  });

  return (
    <RendererProvider renderer={renderer}>
      <SSRProvider>
        <FluentProvider
          theme={webLightTheme}
          style={{
            backgroundImage: 'url(/images/background.png)',
            backgroundRepeat: 'repeat',
          }}
        >
          {children}
        </FluentProvider>
      </SSRProvider>
    </RendererProvider>
  );
}
