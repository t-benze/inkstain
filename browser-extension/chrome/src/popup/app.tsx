import * as React from 'react';
import {
  FluentProvider,
  webLightTheme,
  makeStyles,
} from '@fluentui/react-components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SpacePopup } from '~/chrome-extension/components/SpacePopup';

const queryClient = new QueryClient();
const useClasses = makeStyles({
  root: {
    width: '100%',
    height: '100%',
    padding: '8px 8px',
    boxSizing: 'border-box',
  },
});

export const App = () => {
  const classes = useClasses();
  const [title, setTitle] = React.useState('');
  React.useEffect(() => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      setTitle(tabs[0]?.title || '');
    });
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <FluentProvider theme={webLightTheme} className={classes.root}>
        <SpacePopup
          data={{
            title,
          }}
          behavior="download"
          onSave={(spaceKey, documentPath) => {
            chrome.tabs.query({ active: true }, (tabs) => {
              if (tabs.length > 0 && tabs[0]?.id) {
                const url = tabs[0].url || '';
                chrome.runtime.sendMessage(
                  {
                    action: 'download',
                    targetPath: documentPath,
                    spaceKey: spaceKey,
                    url: url,
                    title: title,
                  },
                  undefined,
                  (result) => {
                    if (result.error) {
                      alert(result.message);
                    } else {
                      window.close();
                    }
                  }
                );
              }
            });
          }}
        />
      </FluentProvider>
    </QueryClientProvider>
  );
};
