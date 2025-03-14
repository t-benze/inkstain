import { screenshotData } from './mock';
type WebclipData = {
  slices: Array<{
    imageDataUrl: string;
    width: number;
    height: number;
  }>;
  meta: { width: number; height: number };
};

export async function updateAttributes(
  settings: { host: string; port: string },
  spaceKey: string,
  documentPath: string,
  attributes: Record<string, string | undefined>
) {
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
export async function addDocument(
  settings: { host: string; port: string },
  spaceKey: string,
  documentPath: string,
  documentData: Blob,
  mimeType: string,
  attributes: {
    url: string;
    title?: string;
  }
) {
  const apiPrefix = `http://${settings.host}:${settings.port}`;
  const extension = mimeType.split('/')[1];
  const path = documentPath + `.${extension}`;
  try {
    // Convert the string to a Blob
    const blob = new Blob([documentData], {
      type: mimeType,
    });
    const formData = new FormData();
    formData.append('document', blob, `${documentPath}.${extension}`);
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
      await updateAttributes(settings, spaceKey, path, attributes);
      return { error: null };
    } else if (response.status === 400) {
      const responseBody = await response.json();
      return { error: responseBody.error, message: responseBody.message };
    } else {
      return {
        error: 'unknown',
        message: 'Unexpected response status: ' + response.status,
      };
    }
  } catch (error) {
    return { error: 'unknown' };
  }
}

function serializeWebclipData(webclipData: WebclipData) {
  const fixedHeader = new ArrayBuffer(12);
  const headerView = new DataView(fixedHeader);
  headerView.setUint32(0, webclipData.meta.width);
  headerView.setUint32(4, webclipData.meta.height);
  headerView.setUint32(8, webclipData.slices.length);
  const dynamicHeaders = new ArrayBuffer(webclipData.slices.length * 12);
  const dynamicView = new DataView(dynamicHeaders);
  const imageSlices = new Array(webclipData.slices.length);
  for (let i = 0; i < webclipData.slices.length; i++) {
    dynamicView.setUint32(i * 12, webclipData.slices[i].width);
    dynamicView.setUint32(i * 12 + 4, webclipData.slices[i].height);
    const encoder = new TextEncoder();
    const encodedBytes = encoder.encode(webclipData.slices[i].imageDataUrl);
    dynamicView.setUint32(i * 12 + 8, encodedBytes.byteLength);
    imageSlices[i] = encodedBytes;
  }
  return [fixedHeader, dynamicHeaders, ...imageSlices];
}

export async function addWebclipDocument(
  settings: { host: string; port: string },
  spaceKey: string,
  documentPath: string,
  webclipData: WebclipData,
  url: string,
  title?: string
) {
  const apiPrefix = `http://${settings.host}:${settings.port}`;
  const path = documentPath + '.inkclip';
  try {
    // Convert the string to a Blob
    const blob = new Blob(serializeWebclipData(webclipData), {
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
      await updateAttributes(settings, spaceKey, path, {
        url: url,
        title: title,
      });
      return { error: null };
    } else if (response.status === 400) {
      return { error: 'Invalid parameters or unable to process the file.' };
    } else if (response.status === 500) {
      return { error: 'Internal server error while adding the document.' };
    } else {
      return { error: 'Unexpected response status:' + response.status };
    }
  } catch (error) {
    return { error: 'Error while adding the document:' + error };
  }
}

export const getPageCaptureData: () => Promise<{
  screenshotData: string[];
  screenDimension: {
    width: number;
    height: number;
  };
  targetRects: {
    width: number;
    height: number;
  }[];
  url: string;
  title?: string;
}> = () => {
  if (chrome.runtime) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { action: 'getPageCaptureData' },
        undefined,
        (result) => {
          resolve(result);
        }
      );
    });
  } else {
    // mock data for development
    return Promise.resolve({
      url: 'https://developer.mozilla.org/en-US/docs/Learn',
      screenshotData: [screenshotData],
      screenDimension: {
        width: 1920,
        height: 1080,
      },
      targetRects: [
        {
          height: 0.883307573415765,
          left: 0.19586120401337792,
          top: 0.11669242658423493,
          width: 0.6020066889632107,
        },
      ],
    });
  }
};
