import * as React from 'react';
import { PDFDocumentProxy } from 'pdfjs-dist';
import { VirtualizerScrollView } from '@fluentui/react-components/unstable';
import { PDFPage } from './PDFPage';

export const PDFPageScrollView = React.forwardRef(
  (
    {
      documentPath,
      spaceKey,
      document,
      scale,
      currentPageNumber = 1,
      onRenderCompleted,
      onPageChange,
      enableTextLayer = false,
      onPageClick,
      virtualizerLength = 5,
    }: {
      documentPath: string;
      spaceKey: string;
      virtualizerLength?: number;
      enableTextLayer?: boolean;
      document: PDFDocumentProxy;
      currentPageNumber?: number;
      scale: number;
      onRenderCompleted?: (
        pageNumber: number,
        viewport: { width: number; height: number }
      ) => void;
      onPageChange?: (pageNum: number) => void;
      onPageClick?: (pageNum: number) => void;
    },
    ref
  ) => {
    const pageGap = 8;
    const totalPages = document.numPages;
    const [pageHeight, setPageHeight] = React.useState(0);

    React.useEffect(() => {
      document.getPage(1).then((page) => {
        const viewport = page.getViewport({ scale });
        setPageHeight(viewport.height);
      });
    }, [scale, document]);

    const scrollViewRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(
      ref,
      () => {
        return scrollViewRef.current;
      },
      []
    );
    React.useEffect(() => {
      const scrollView = scrollViewRef.current;
      const handleScroll = (e: Event) => {
        const target = e.target as HTMLDivElement;
        const pageInFocus = Math.floor(
          target.scrollTop / (pageHeight + pageGap)
        );
        if (pageInFocus !== currentPageNumber - 1) {
          onPageChange?.(pageInFocus + 1);
        }
      };
      if (scrollView) {
        scrollView?.addEventListener('scroll', handleScroll);
      }
      return () => {
        scrollView?.removeEventListener('scroll', handleScroll);
      };
    }, [pageHeight, currentPageNumber, onPageChange]);

    React.useEffect(() => {
      if (scrollViewRef.current) {
        const distanceUnit = pageHeight + pageGap;
        const pageInFocus = Math.floor(
          scrollViewRef.current.scrollTop / distanceUnit
        );
        if (pageInFocus !== currentPageNumber - 1) {
          scrollViewRef.current.scrollTo({
            top: (currentPageNumber - 1) * distanceUnit,
            behavior: 'instant',
          });
        }
      }
    }, [currentPageNumber, pageHeight]);

    return (
      <VirtualizerScrollView
        numItems={totalPages}
        itemSize={pageHeight ?? 1000}
        container={{
          //@ts-expect-error - data-test is not a valid prop
          'data-test': 'pdfViewer-scene',
          role: 'list',
          style: {
            position: 'relative',
            maxHeight: '100%',
            overflowY: 'scroll',
          },
        }}
        virtualizerLength={virtualizerLength}
        scrollViewRef={scrollViewRef}
      >
        {(index: number) => {
          return (
            <PDFPage
              spaceKey={spaceKey}
              documentPath={documentPath}
              role="listitem"
              aria-posinset={index}
              aria-setsize={totalPages}
              key={`scrollview-child-${index}`}
              document={document}
              pageNumber={index + 1}
              scale={scale}
              onRenderCompleted={onRenderCompleted}
              style={{
                marginLeft: 'auto',
                marginRight: 'auto',
                marginBottom: `${pageGap}px`,
              }}
              enableTextLayer={enableTextLayer}
              onClick={onPageClick}
            />
          );
        }}
      </VirtualizerScrollView>
    );
  }
);
