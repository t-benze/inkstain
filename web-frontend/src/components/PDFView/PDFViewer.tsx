import 'pdfjs-dist/webpack.mjs';
import * as React from 'react';
import { tokens, makeStyles, shorthands } from '@fluentui/react-components';
import { useLayoutEffect, useEffect, useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentLoadingTask, PDFDocumentProxy } from 'pdfjs-dist';
import { PDFToolbar } from './PDFToolbar';
import { PDFPage } from './PDFPage';
import { PDFPageScrollView } from './PDFPageScrollView';
import './viewer.css';

interface PDFViewerProps {
  url: string;
  onDocumentLoadSuccess?: (document: PDFDocumentProxy) => void;
  onDocumentLoadFailure?: (error: Error) => void;
  initialPage?: number;
}
const useStyles = makeStyles({
  root: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: tokens.colorNeutralBackground4,
  },
  scene: {
    display: 'flex',
    flexGrow: 1,
    height: 0,
    ...shorthands.overflow('scroll', 'scroll'),
  },
});

/**
 * The size of a pdf page is measured in points, and 1 point is equal to 1/72 of an inch.
 * Therefore to convert the size of a page to pixel values, it needs to be scaled by the device pixel ratio.
 */
const DEFAULT_SCALE = window.devicePixelRatio || 1;
const SCALE_STEPS = [
  0.1, 0.25, 0.5, 0.75, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5, 6, 7, 8,
].map((step) => step * DEFAULT_SCALE);

export const PDFViewer = React.forwardRef(
  (
    {
      url,
      onDocumentLoadSuccess,
      onDocumentLoadFailure,
      initialPage = 1,
    }: PDFViewerProps,
    ref
  ) => {
    const styles = useStyles();
    const [pdfDocument, setPDFDocument] = useState<PDFDocumentProxy | null>(
      null
    );
    const loadingTaskRef = useRef<PDFDocumentLoadingTask | null>(null);
    const [currentPageNumber, setCurrentPageNumber] = useState<number>(0);
    const [scale, setScale] = useState<number>(DEFAULT_SCALE);
    const [defaultViewportWidth, setDefaultViewportWidth] = useState<number>(0);
    const [defaultViewportHeight, setDefaultViewportHeight] =
      useState<number>(0);
    const [enableScroll, setEnableScroll] = useState<boolean>(false);
    const onEnableScrollChange = React.useCallback((enable: boolean) => {
      setEnableScroll(enable);
    }, []);

    useEffect(() => {
      if (!loadingTaskRef.current) {
        loadingTaskRef.current = pdfjsLib.getDocument(url);
      }
      loadingTaskRef.current.promise
        .then((loadedPdfDocument) => {
          if (!pdfDocument) {
            setPDFDocument(loadedPdfDocument);
            onDocumentLoadSuccess?.(loadedPdfDocument);
          }
          loadedPdfDocument.getMetadata().then((metadata) => {
            console.log('loaded document meta', metadata);
          });
          setCurrentPageNumber(initialPage);
        })
        .catch((error: Error) => {
          onDocumentLoadFailure?.(error);
        });
    }, [
      url,
      pdfDocument,
      loadingTaskRef,
      onDocumentLoadFailure,
      onDocumentLoadSuccess,
      initialPage,
    ]);

    const onScaleChange = React.useCallback((newScale: number) => {
      setScale(newScale);
    }, []);

    const sceneRef = React.useRef<HTMLDivElement>(null);
    const [sceneWidth, setSceneWidth] = useState<number>(0);
    const [sceneHeight, setSceneHeight] = useState<number>(0);
    const windowResizeHandler = React.useCallback(() => {
      if (sceneRef.current) {
        if (
          sceneRef.current.clientWidth === sceneWidth ||
          sceneRef.current.clientHeight === sceneHeight
        ) {
          setSceneWidth(sceneRef.current.clientWidth);
          setSceneHeight(sceneRef.current.clientHeight);
        }
      }
    }, [sceneRef, sceneWidth, sceneHeight]);

    useLayoutEffect(() => {
      if (sceneRef.current) {
        setSceneWidth(sceneRef.current.clientWidth);
        setSceneHeight(sceneRef.current.clientHeight);
      }
      window.addEventListener('resize', windowResizeHandler);
      return () => {
        window.removeEventListener('resize', windowResizeHandler);
      };
    }, [
      pdfDocument,
      enableScroll,
      windowResizeHandler,
      sceneRef,
      sceneWidth,
      sceneHeight,
    ]);

    const handleRenderPageCompleted = React.useCallback(
      (pageNum: number, viewport: { width: number; height: number }) => {
        if (pageNum === initialPage) {
          sceneRef.current?.setAttribute('data-ready', 'true');
        }
        if (scale === DEFAULT_SCALE) {
          setDefaultViewportHeight(viewport.height);
          setDefaultViewportWidth(viewport.width);
        }
      },
      [
        initialPage,
        setDefaultViewportHeight,
        setDefaultViewportWidth,
        sceneRef,
        scale,
      ]
    );

    return (
      <div className={styles.root}>
        <PDFToolbar
          onPageChange={(pageNum) => {
            setCurrentPageNumber(pageNum);
          }}
          scale={scale}
          onScaleChange={onScaleChange}
          currentPage={currentPageNumber}
          numOfPages={pdfDocument?.numPages || 0}
          sceneWidth={sceneWidth}
          sceneHeight={sceneHeight}
          initViewportWidth={defaultViewportWidth}
          initViewportHeight={defaultViewportHeight}
          initScale={DEFAULT_SCALE}
          scaleSteps={SCALE_STEPS}
          enableScroll={enableScroll}
          onEnableScrollChange={onEnableScrollChange}
        />
        {pdfDocument ? (
          enableScroll ? (
            <PDFPageScrollView
              ref={sceneRef}
              onPageChange={(pageNum) => {
                setCurrentPageNumber(pageNum);
              }}
              document={pdfDocument}
              scale={scale}
              currentPageNumber={currentPageNumber}
              onRenderCompleted={handleRenderPageCompleted}
            />
          ) : (
            <div
              data-test="pdfViewer-scene"
              ref={sceneRef}
              className={styles.scene}
            >
              <PDFPage
                pageNumber={currentPageNumber}
                scale={scale}
                onRenderCompleted={handleRenderPageCompleted}
                document={pdfDocument}
              />
            </div>
          )
        ) : null}
      </div>
    );
  }
);
