// import * as htmlToImage from 'html-to-image';
import i18n from 'i18next';
import enTranslation from '~/chrome-extension/assets/locales/en/translation.json';
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

function getVisibleArea(element: HTMLElement) {
  const rect = element.getBoundingClientRect();

  // Subtract scrollbar dimensions if present
  const scrollbarWidth =
    window.innerWidth - document.documentElement.clientWidth;
  const scrollbarHeight =
    window.innerHeight - document.documentElement.clientHeight;

  const visibleWidth = Math.max(
    0,
    Math.min(rect.right, window.innerWidth - scrollbarWidth) -
      Math.max(rect.left, 0)
  );
  const visibleHeight = Math.max(
    0,
    Math.min(rect.bottom, window.innerHeight - scrollbarHeight) -
      Math.max(rect.top, 0)
  );

  return {
    width: visibleWidth,
    height: visibleHeight,
    top: rect.top,
    left: rect.left,
  };
}

function addMaskToElement(element: HTMLElement) {
  const visibleRect = getVisibleArea(element);
  const topMask = document.createElement('div');
  topMask.style.position = 'fixed';
  topMask.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  topMask.style.top = '0px';
  topMask.style.left = '0px';
  topMask.style.width = '100%';
  topMask.style.height = `${visibleRect.top}px`;
  topMask.style.zIndex = '9999';
  const leftMask = document.createElement('div');
  leftMask.style.position = 'fixed';
  leftMask.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  leftMask.style.top = `${visibleRect.top}px`;
  leftMask.style.left = '0px';
  leftMask.style.width = `${visibleRect.left}px`;
  leftMask.style.height = `${visibleRect.height}px`;
  leftMask.style.zIndex = '9999';
  const rightMask = document.createElement('div');
  rightMask.style.position = 'fixed';
  rightMask.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  rightMask.style.top = `${visibleRect.top}px`;
  rightMask.style.left = `${visibleRect.left + visibleRect.width}px`;
  rightMask.style.width = `calc(100% - ${
    visibleRect.left + visibleRect.width
  }px)`;
  rightMask.style.height = `${visibleRect.height}px`;
  rightMask.style.zIndex = '9999';
  const bottomMask = document.createElement('div');
  bottomMask.style.position = 'fixed';
  bottomMask.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  bottomMask.style.top = `${visibleRect.top + visibleRect.height}px`;
  bottomMask.style.left = '0px';
  bottomMask.style.width = '100%';
  bottomMask.style.height = `calc(100% - ${
    visibleRect.top + visibleRect.height
  }px)`;
  bottomMask.style.zIndex = '9999';

  document.body.appendChild(topMask);
  document.body.appendChild(leftMask);
  document.body.appendChild(rightMask);
  document.body.appendChild(bottomMask);

  return () => {
    document.body.removeChild(topMask);
    document.body.removeChild(leftMask);
    document.body.removeChild(rightMask);
    document.body.removeChild(bottomMask);
  };
}

async function startCapturing() {
  return new Promise<{
    dimension: {
      width: number;
      height: number;
      top: number;
      left: number;
      scrollTop: number;
      contentHeight: number;
      contentWidth: number;
      windowHeight: number;
      windowWidth: number;
    };
    cleanup: () => void;
  }>((resolve) => {
    function highlightElement(
      element: HTMLElement,
      mouseMoveListenerRefence: (e: MouseEvent) => void
    ) {
      // Store original styles
      const originalStyles = {
        border: element.style.border,
        cursor: element.style.cursor,
      };

      element.style.border = '2px dashed gray';
      element.style.cursor = 'grab';

      function removeHighlight() {
        element.style.border = originalStyles.border;
        element.style.cursor = originalStyles.cursor;
        element.removeEventListener('click', clickListener);
      }

      const clickListener = async (e: MouseEvent) => {
        e.preventDefault();
        removeHighlight();
        const cleanup = addMaskToElement(element);
        document.removeEventListener('mouseover', mouseMoveListenerRefence);
        const visibleArea = getVisibleArea(element);
        setTimeout(() => {
          resolve({
            dimension: {
              contentHeight: element.clientHeight,
              contentWidth: element.clientWidth,
              width: visibleArea.width,
              height: visibleArea.height,
              top: visibleArea.top,
              left: visibleArea.left,
              scrollTop: window.scrollY,
              windowHeight: window.innerHeight,
              windowWidth: window.innerWidth,
            },
            cleanup,
          });
        });
      };

      element.addEventListener('click', clickListener);
      return removeHighlight;
    }

    let removeHighlight: ReturnType<typeof highlightElement> | null = null;
    let selectedNode: HTMLElement | null = null;
    const mouseMoveListener = (e: MouseEvent) => {
      if (selectedNode && e.target === selectedNode) return;
      if (removeHighlight) removeHighlight();
      selectedNode = e.target as HTMLElement;
      removeHighlight = highlightElement(selectedNode, mouseMoveListener);
    };
    document.addEventListener('mouseover', mouseMoveListener);
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startClip') {
    startCapturing().then(({ dimension, cleanup }) => {
      chrome.runtime.sendMessage(
        {
          action: 'capturePage',
          url: window.location.href,
          title: document.title,
          dimension,
        },
        undefined,
        () => {
          cleanup();
        }
      );
    });
    return true;
  } else if (request.action === 'scrollTo') {
    const { scrollTop } = request;
    window.scrollTo({
      top: scrollTop,
      behavior: 'instant',
      left: 0,
    });
  }
});
