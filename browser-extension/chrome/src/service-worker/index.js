const DEFAULT_HOST = 'localhost';
const DEFAULT_PORT = '6060';

function getAppSettings() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('app_settings', (result) => {
      let settings = {};
      try {
        settings = result.app_settings ? JSON.parse(result.app_settings) : {};
      } catch (error) {
        reject(error);
      }
      const data = {
        host: settings.host || DEFAULT_HOST,
        port: settings.port || DEFAULT_PORT,
      };
      resolve(data);
    });
  });
}

/**
 * @type {Array<{id: number, url: string, spaceKey: string, targetFolder: string, pathSep: string, title: string | undefined}>}
 */
let downloadTasks = [];

async function updateAttributes(spaceKey, documentPath, attributes) {
  const settings = await getAppSettings();
  const apiPrefix = `http://${settings.host}:${settings.port}`;
  const response = await fetch(
    `${apiPrefix}/api/v1/documents/${spaceKey}/attributes?path=${encodeURIComponent(
      documentPath
    )}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        attributes: attributes,
      }),
    }
  );
  if (response.status === 200) {
    return { error: null };
  }
  return { error: 'Error while adding attributes to inkstain server' };
}

async function addWebclipDocument(
  spaceKey,
  documentPath,
  webclipData,
  url,
  title
) {
  const settings = await getAppSettings();
  const apiPrefix = `http://${settings.host}:${settings.port}`;
  const path = documentPath + '.inkclip';
  try {
    // Convert the string to a Blob
    const blob = new Blob([JSON.stringify(webclipData)], {
      type: 'application/inkclip',
    });
    const formData = new FormData();
    formData.append('document', blob, `webclip.inkclip`);
    const response = await fetch(
      `${apiPrefix}/api/v1/documents/${spaceKey}/add?path=${encodeURIComponent(
        path
      )}`,
      {
        method: 'POST',
        body: formData,
      }
    );
    if (response.status === 201) {
      await updateAttributes(spaceKey, documentPath, {
        url: url,
        title: title,
      });
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

chrome.downloads.onChanged.addListener(async function (delta) {
  if (!delta.state || delta.state.current !== 'complete') {
    return;
  }
  const task = downloadTasks.find((task) => task.id === delta.id);
  if (!task) {
    return;
  }

  downloadTasks.splice(downloadTasks.indexOf(task), 1);
  chrome.downloads.search({ id: task.id }, async (downloads) => {
    if (downloads.length === 0) {
      return;
    }
    const download = downloads[0];
    const settings = await getAppSettings();
    const apiPrefix = `http://${settings.host}:${settings.port}`;
    const filename = download.filename.split(task.pathSep).pop();
    const targetPath = task.targetFolder + task.pathSep + filename;
    const response = await fetch(
      `${apiPrefix}/api/v1/documents/${task.spaceKey}/import`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          localFilePath: download.filename,
          targetPath: targetPath,
          mimeType: download.mime,
        }),
      }
    );
    if (response.status === 200) {
      await updateAttributes(task.spaceKey, targetPath, {
        url: task.url,
        title: task.title,
      });
    } else {
      console.error('Error while importing the document:', response.status);
    }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'stopClip') {
    addWebclipDocument(
      message.spaceKey,
      message.documentPath,
      message.webclipData,
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
    chrome.storage.local.set({ spaceKey: message.spaceKey }).then(() => {
      sendResponse(true);
    });
    return true;
  } else if (message.action === 'getSettings') {
    getAppSettings()
      .then((data) => {
        sendResponse(data);
      })
      .catch((error) => {
        console.error('Error while getting settings:', error);
        sendResponse(null);
      });
    return true;
  } else if (message.action === 'setSettings') {
    chrome.storage.local
      .set({
        app_settings: JSON.stringify(message.settings),
      })
      .then(() => {
        sendResponse(true);
      });
    return true;
  } else if (message.action === 'download') {
    const url = message.url;
    fetch(url).then((response) => {
      const contentType = response.headers.get('content-type');
      const filename = url.split('/').pop();
      if (contentType.startsWith('application/')) {
        chrome.downloads.download(
          {
            url,
            filename: filename,
            conflictAction: 'overwrite',
          },
          (downloadId) => {
            const { targetFolder, pathSep } = message;
            console.log('downdload id', downloadId);
            downloadTasks.push({
              id: downloadId,
              url: url,
              spaceKey: message.spaceKey,
              pathSep: pathSep,
              targetFolder: targetFolder,
              title: message.title,
            });
          }
        );
      }
    });
    return true;
  }
});
