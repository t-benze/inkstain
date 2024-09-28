export function getSettings(): Promise<{ host: string; port: string }> {
  return new Promise((resolve, reject) => {
    chrome &&
      chrome.runtime &&
      chrome.runtime.sendMessage(
        { action: 'getSettings' },
        undefined,
        (result: { host: string; port: string }) => {
          if (result) {
            resolve(result);
          } else {
            reject(new Error('Failed to get settings'));
          }
        }
      );
  });
}

export function setSettings(settings: { host: string; port: string }) {
  return new Promise((resolve, reject) => {
    chrome &&
      chrome.runtime &&
      chrome.runtime.sendMessage(
        { action: 'setSettings', settings },
        undefined,
        (result) => {
          if (result) {
            resolve(result);
          } else {
            reject(new Error('Failed to set settings'));
          }
        }
      );
  });
}
