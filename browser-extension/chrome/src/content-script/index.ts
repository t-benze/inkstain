// import * as htmlToImage from 'html-to-image';
import i18n from 'i18next';
import enTranslation from '~/chrome-extension/assets/locales/en/translation.json';
import LanguageDetector from 'i18next-browser-languagedetector';

const cursorSVG = `
<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16.9511 2.50391C17.7275 2.50391 18.449 2.9042 18.86 3.56291L20.3811 6.00086H22.75C24.5449 6.00086 26 7.45593 26 9.25086V21.7509C26 23.5458 24.5449 25.0009 22.75 25.0009H5.25C3.45507 25.0009 2 23.5458 2 21.7509V9.25086C2 7.45593 3.45507 6.00086 5.25 6.00086H7.81851L9.20109 3.62296C9.6039 2.93016 10.3448 2.50391 11.1462 2.50391H16.9511ZM16.9511 4.00391H11.1462C10.9172 4.00391 10.7031 4.1083 10.562 4.28355L10.4978 4.37692L8.89837 7.12784C8.7641 7.35877 8.51713 7.50086 8.25 7.50086H5.25C4.2835 7.50086 3.5 8.28436 3.5 9.25086V21.7509C3.5 22.7174 4.2835 23.5009 5.25 23.5009H22.75C23.7165 23.5009 24.5 22.7174 24.5 21.7509V9.25086C24.5 8.28436 23.7165 7.50086 22.75 7.50086H19.965C19.7062 7.50086 19.4657 7.36743 19.3287 7.14786L17.5874 4.35691C17.4504 4.13734 17.2099 4.00391 16.9511 4.00391ZM14 9.50185C17.0376 9.50185 19.5 11.9643 19.5 15.0018C19.5 18.0394 17.0376 20.5018 14 20.5018C10.9624 20.5018 8.5 18.0394 8.5 15.0018C8.5 11.9643 10.9624 9.50185 14 9.50185ZM14 11.0018C11.7909 11.0018 10 12.7927 10 15.0018C10 17.211 11.7909 19.0018 14 19.0018C16.2091 19.0018 18 17.211 18 15.0018C18 12.7927 16.2091 11.0018 14 11.0018Z" fill="#212121"/>
</svg>
`;
const cursorSVGDataUrl = `data:image/svg+xml;base64,${btoa(cursorSVG)}`;

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
  }>((resolve, reject) => {
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
      // element.style.cursor = 'grab';
      // element.style.cursor =
      //   'url(chrome-extension://assets/images/cursor-camera.svg), auto';
      element.style.cursor = `url(${cursorSVGDataUrl}), auto`;
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

    function keyDownListener(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        reject({
          error: 'canceled',
        });
        if (removeHighlight) removeHighlight();
        window.removeEventListener('keydown', keyDownListener);
        document.removeEventListener('mouseover', mouseMoveListener);
      }
    }
    window.addEventListener('keydown', keyDownListener);
    document.addEventListener('mouseover', mouseMoveListener);
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startClip') {
    startCapturing()
      .then(({ dimension, cleanup }) => {
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
      })
      .catch((e) => {
        if (e.error === 'canceled') {
          return;
        }
        throw e;
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
