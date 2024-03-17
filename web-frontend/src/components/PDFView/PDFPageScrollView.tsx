import * as React from 'react';
import { PDFDocumentProxy } from 'pdfjs-dist';
import { VirtualizerScrollView } from '@fluentui/react-components/unstable';
import { PDFPage } from './PDFPage';

export const PDFPageScrollView = React.forwardRef(
  (
    {
      document,
      scale,
      currentPageNumber,
      onRenderCompleted,
      onPageChange,
    }: {
      document: PDFDocumentProxy;
      currentPageNumber: number;
      scale: number;
      onRenderCompleted?: (
        pageNumber: number,
        viewport: { width: number; height: number }
      ) => void;
      onPageChange?: (pageNum: number) => void;
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
        virtualizerLength={totalPages}
        scrollViewRef={scrollViewRef}
      >
        {(index: number) => {
          return (
            <PDFPage
              role="listitem"
              aria-posinset={index}
              aria-setsize={totalPages}
              key={`scrollview-child-${index}`}
              document={document}
              pageNumber={index + 1}
              scale={scale}
              onRenderCompleted={onRenderCompleted}
              style={{ marginBottom: `${pageGap}px` }}
            />
          );
        }}
      </VirtualizerScrollView>
    );
  }
);
