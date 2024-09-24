import * as React from 'react';
export const useSettings = () => {
  const [host, setHost] = React.useState<string>('');
  const [port, setPort] = React.useState<string>('');

  React.useEffect(() => {
    chrome &&
      chrome.runtime &&
      chrome.runtime.sendMessage(
        { action: 'getSettings' },
        undefined,
        (result: { host: string; port: string }) => {
          if (result) {
            setHost(result.host);
            setPort(result.port);
          }
        }
      );
  }, []);

  return { host, port };
};
