// import * as htmlToImage from 'html-to-image';
import html2Canvas from 'html2canvas';
import i18n from 'i18next';
import enTranslation from '../assets/locales/en/translation.json';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    debug: true,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources: {
      en: {
        translation: enTranslation,
      },
    },
  });

function highlightElement(
  element: HTMLElement,
  config: {
    host: string;
    port: string;
  },
  onImageCapture: (params: {
    imageData: string;
    dimension: { width: number; height: number };
  }) => void
) {
  // Store original styles
  const originalStyles = {
    transform: element.style.transform,
    transition: element.style.transition,
    zIndex: element.style.zIndex,
    boxShadow: element.style.boxShadow,
    position: element.style.position,
    cursor: element.style.cursor,
  };

  // Ensure the element can be transformed
  if (getComputedStyle(element).position === 'static') {
    element.style.position = 'relative';
  }

  // Apply highlight styles
  element.style.transform = 'translateY(-5px)';
  element.style.transition = 'all 0.3s ease';
  element.style.zIndex = '1000'; // Ensure it's above siblings
  element.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
  element.style.cursor = 'grab';

  const clickListener = async (e: MouseEvent) => {
    e.preventDefault();
    const canvas = await html2Canvas(element, {
      scale: 1.5,
      proxy: `http://${config.host}:${config.port}/api/v1/proxy/static`,
    });
    onImageCapture({
      imageData: canvas.toDataURL(),
      dimension: { width: canvas.width, height: canvas.height },
    });
  };
  element.addEventListener('click', clickListener);

  // Return a function to remove the highlight
  return function removeHighlight() {
    element.style.transform = originalStyles.transform;
    element.style.transition = originalStyles.transition;
    element.style.zIndex = originalStyles.zIndex;
    element.style.boxShadow = originalStyles.boxShadow;
    element.style.cursor = originalStyles.cursor;
    if (originalStyles.position === '') {
      element.style.position = '';
    }
    element.removeEventListener('click', clickListener);
  };
}

async function startCapturing(config: { host: string; port: string }) {
  let removeHighlight: ReturnType<typeof highlightElement> | null = null;
  let selectedNode: HTMLElement | null = null;
  return new Promise<{
    imageData: string;
    dimension: { width: number; height: number };
  }>((resolve) => {
    const mouseMoveListener = (e: MouseEvent) => {
      if (selectedNode && e.target === selectedNode) return;
      if (removeHighlight) removeHighlight();
      selectedNode = e.target as HTMLElement;
      removeHighlight = highlightElement(selectedNode, config, (params) => {
        resolve(params);
        if (removeHighlight) removeHighlight();
        document.removeEventListener('mouseover', mouseMoveListener);
      });
    };
    document.addEventListener('mouseover', mouseMoveListener);
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startClip') {
    const { spaceKey, targetFolder, pathSep, host, port } = request;
    startCapturing({ host, port }).then(({ imageData, dimension }) => {
      const documentName = window.prompt(
        i18n.t('clip_action_prompt'),
        document.title
      );
      if (documentName) {
        chrome.runtime.sendMessage(
          {
            action: 'stopClip',
            webclipData: {
              imageData,
              dimension,
            },
            spaceKey,
            url: window.location.href,
            title: documentName,
            documentPath:
              (targetFolder.startsWith(pathSep)
                ? targetFolder.replace(pathSep, '')
                : targetFolder) +
              pathSep +
              documentName,
            dimension,
          },
          undefined,
          (response) => {
            if (!response || response.error) {
              alert(i18n.t('clip_action_error'));
            } else {
              alert(i18n.t('clip_action_success'));
            }
          }
        );
      }
    });
  }
  return true;
});
