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
  onImageCapture: (imageData: string) => void
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
      proxy: 'http://localhost:6060/api/v1/proxy',
    });
    onImageCapture(canvas.toDataURL());
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

async function startCapturing() {
  let removeHighlight: ReturnType<typeof highlightElement> | null = null;
  let selectedNode: HTMLElement | null = null;
  return new Promise<string>((resolve) => {
    const mouseMoveListener = (e: MouseEvent) => {
      if (selectedNode && e.target === selectedNode) return;
      if (removeHighlight) removeHighlight();
      selectedNode = e.target as HTMLElement;
      removeHighlight = highlightElement(selectedNode, (imageData) => {
        resolve(imageData);
        if (removeHighlight) removeHighlight();
        document.removeEventListener('mouseover', mouseMoveListener);
      });
    };
    document.addEventListener('mouseover', mouseMoveListener);
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startClip') {
    const { spaceKey, targetFolder, pathSep } = request;
    startCapturing().then((imageData) => {
      const documentName = window.prompt(
        i18n.t('clip_action_prompt'),
        document.title
      );
      chrome.runtime.sendMessage(
        {
          action: 'stopClip',
          imageData,
          spaceKey,
          url: window.location.href,
          title: documentName,
          documentPath:
            (targetFolder.startsWith(pathSep)
              ? targetFolder.replace(pathSep, '')
              : targetFolder) +
            pathSep +
            documentName,
        },
        undefined,
        (response) => {
          console.log('receive', response);
          if (!response || response.error) {
            alert(i18n.t('clip_action_error'));
          } else {
            alert(i18n.t('clip_action_success'));
          }
        }
      );
    });
  }
  return true;
});
