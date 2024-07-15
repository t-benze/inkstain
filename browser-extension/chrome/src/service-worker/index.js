const DEFAULT_HOST = 'localhost';
const DEFAULT_PORT = '6060';
const DEFAULT_HOST_ORIGIN = `http://${DEFAULT_HOST}:${DEFAULT_PORT}`;

async function addDocument(spaceKey, documentPath, imageData, url, title) {
  const host = DEFAULT_HOST_ORIGIN;
  const path = documentPath + '.inkclip';
  try {
    // Convert the string to a Blob
    const blob = new Blob([imageData], { type: 'application/inkclip' });
    const formData = new FormData();
    formData.append('document', blob, `webclip.inkclip`);
    const response = await fetch(
      `${host}/api/v1/documents/${spaceKey}/add?path=${encodeURIComponent(
        path
      )}`,
      {
        method: 'POST',
        body: formData,
      }
    );
    if (response.status === 201) {
      try {
        const response = await fetch(
          `${host}/api/v1/documents/${spaceKey}/attributes?path=${encodeURIComponent(
            path
          )}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              attributes: {
                url: url,
                title: title,
              },
            }),
          }
        );
        if (response.status === 200) {
          return { error: null };
        }
      } catch (error) {
        console.error('Error while adding attributes:', error);
      }
    } else if (response.status === 400) {
      console.error('Invalid parameters or unable to process the file.');
    } else if (response.status === 500) {
      console.error('Internal server error while adding the document.');
    } else {
      console.error('Unexpected response status:', response.status);
    }
  } catch (error) {
    console.error('Error while adding the document:', error);
  }
  return { error: 'Error while adding the webclip to inkstain server' };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'stopClip') {
    addDocument(
      message.spaceKey,
      message.documentPath,
      message.imageData,
      message.url,
      message.title
    ).then((result) => {
      sendResponse(result);
    });
    return true;
  } else if (message.action === 'getSpaceKey') {
    chrome.storage.local.get('spaceKey', (result) => {
      sendResponse((result && result.spaceKey) || '');
    });
    return true;
  } else if (message.action === 'setSpaceKey') {
    chrome.storage.local.set({ spaceKey: message.spaceKey });
    sendResponse();
    return true;
  } else if (message.action === 'getSettings') {
    chrome.storage.local.get('app_settings', (result) => {
      const data = {
        host: result.host || DEFAULT_HOST,
        port: result.port || DEFAULT_PORT,
      };
      sendResponse(data);
    });
    return true;
  } else if (message.action === 'setSettings') {
    chrome.storage.local.set('app_settings', message.settings);
    sendResponse();
    return true;
  }
});
