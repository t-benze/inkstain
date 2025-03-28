import {
  addDocument,
  updateAttributes,
} from '~/chrome-extension/utils/document';

let pageCaptureData: {
  url: string;
  title?: string;
  screenshotData: string[];
  screenDimension: {
    width: number;
    height: number;
  };
  targetRects: {
    width: number;
    height: number;
  }[];
} | null = null;

function getAppSettings(): Promise<{ host: string; port: string }> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('app_settings', (result) => {
      let settings: { host: string; port: string } = {
        host: 'localhost',
        port: '6060',
      };
      try {
        settings = result.app_settings ? JSON.parse(result.app_settings) : {};
      } catch (error) {
        reject(error);
      }
      const data = {
        host: settings.host,
        port: settings.port,
      };
      resolve(data);
    });
  });
}

function capturePage(
  params: {
    width: number;
    height: number;
    top: number;
    left: number;
    scrollTop: number;
    contentHeight: number;
    contentWidth: number;
    windowHeight: number;
    windowWidth: number;
  },
  extraParams: {
    url: string;
    title?: string;
  },
  callback: () => void
) {
  const images: string[] = [];
  const targetRects: {
    width: number;
    height: number;
    top: number;
    left: number;
  }[] = [];
  const { url, title } = extraParams;
  chrome.tabs.query(
    { active: true, lastFocusedWindow: true },
    async ([tab]) => {
      if (tab && tab.id) {
        let scrollTop = params.scrollTop;
        let scrollDistance = params.height;
        let remainingRange = params.contentHeight - scrollDistance;
        while (scrollDistance > 0) {
          // Capture the visible portion of the page
          const screenshotUrl = await chrome.tabs.captureVisibleTab(undefined, {
            format: 'png',
          });
          images.push(screenshotUrl);
          targetRects.push({
            width: params.width / params.windowWidth,
            left: params.left / params.windowWidth,
            top:
              (params.top + params.height - scrollDistance) /
              params.windowHeight,
            height: scrollDistance / params.windowHeight,
          });
          scrollDistance = Math.min(remainingRange, params.height);
          remainingRange -= scrollDistance;
          scrollTop += scrollDistance;
          chrome.tabs.sendMessage(tab.id, {
            action: 'scrollTo',
            scrollTop: scrollTop,
          });
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        pageCaptureData = {
          screenshotData: images,
          screenDimension: {
            width: params.windowWidth,
            height: params.windowHeight,
          },
          url: url,
          title: title,
          targetRects: targetRects,
        };
        chrome.windows.create({
          url: chrome.runtime.getURL('screenshot/index.html'), // Reference to internal HTML file
          type: 'popup',
          width: Math.max(800, params.width),
          height: params.windowHeight,
        });
        callback();
      }
    }
  );
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getSpaceKey') {
    chrome.storage.local.get('spaceKey', (result) => {
      // @ts-expect-error sendResponse is not typed correctly
      sendResponse((result && result.spaceKey) || '');
    });
    return true;
  } else if (message.action === 'setSpaceKey') {
    chrome.storage.local.set({ spaceKey: message.spaceKey }).then(() => {
      // @ts-expect-error sendResponse is not typed correctly
      sendResponse(true);
    });
    return true;
  } else if (message.action === 'getSettings') {
    getAppSettings()
      .then((data) => {
        // @ts-expect-error sendResponse is not typed correctly
        sendResponse(data);
      })
      .catch((error) => {
        console.error('Error while getting settings:', error);
        // @ts-expect-error sendResponse is not typed correctly
        sendResponse(null);
      });
    return true;
  } else if (message.action === 'setSettings') {
    chrome.storage.local
      .set({
        app_settings: JSON.stringify(message.settings),
      })
      .then(() => {
        // @ts-expect-error sendResponse is not typed correctly
        sendResponse(true);
      });
    return true;
  } else if (message.action === 'capturePage') {
    const dimension = message.dimension;
    const url = message.url;
    const title = message.title;
    capturePage(dimension, { url, title }, () => {
      sendResponse();
    });
    return true;
  } else if (message.action === 'getPageCaptureData') {
    setTimeout(() => {
      console.log('send response', pageCaptureData);
      // @ts-expect-error sendResponse is not typed correctly
      sendResponse(pageCaptureData);
    }, 0);
    return true;
  } else if (message.action === 'download') {
    const { targetPath, url, spaceKey, title } = message;
    fetch(url).then((response) => {
      const contentType = response.headers.get('content-type') as string;
      response
        .blob()
        .then(async (documentData) => {
          const settings = await getAppSettings();
          return addDocument(
            settings,
            spaceKey,
            targetPath,
            documentData,
            contentType,
            {
              url: url,
              title: title,
            }
          );
        })
        .then((response) => {
          // @ts-expect-error sendResponse is not typed correctly
          sendResponse(response);
        })
        .catch((error) => {
          // @ts-expect-error sendResponse is not typed correctly
          sendResponse({
            error: 'unknown',
            message: error.message,
          });
        });
    });
    return true;
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id) {
    const url = tab.url || '';
    if (url) {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          chrome.tabs.sendMessage(tab.id, {
            action: 'startClip',
          });
        } else {
          // chrome.action.openPopup();
          chrome.action.setPopup({
            tabId: tab.id,
            popup: 'popup/index.html',
          });
          chrome.action.openPopup();
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  }
});
