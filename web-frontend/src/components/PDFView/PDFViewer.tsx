import 'pdfjs-dist/webpack.mjs';
import * as React from 'react';
import { tokens, makeStyles, shorthands } from '@fluentui/react-components';
import { useLayoutEffect, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { useDocument } from '~/web/hooks/useDocument';
import { PDFToolbar } from './PDFToolbar';
import { PDFPage } from './PDFPage';
import { PDFPageScrollView } from './PDFPageScrollView';
import { usePDFDocument } from './hooks';
import { PDFViewerContext } from './context';
import './viewer.css';

export interface PDFViewHandle {
  goToPage: (pageNum: number) => void;
}

export interface PDFViewerProps {
  spaceKey: string;
  documentPath: string;
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
 * Because we want the visual dimension of the pdf canvas to be consistent across devices,and we can
 * only set the scale of the pdf rendering, need to mulitply the scale by the device pixel ratio, i.e.,
 * to have a larger scale on a high resolution device.
 */
const DEFAULT_SCALE = window.devicePixelRatio || 1;
const SCALE_STEPS = [
  0.1, 0.25, 0.5, 0.75, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5, 6, 7, 8,
].map((step) => step * DEFAULT_SCALE);

export const PDFViewer = React.forwardRef<PDFViewHandle, PDFViewerProps>(
  (
    {
      spaceKey,
      documentPath,
      onDocumentLoadSuccess,
      onDocumentLoadFailure,
      initialPage = 1,
    },
    ref
  ) => {
    const styles = useStyles();
    const url = useDocument(documentPath);
    const pdfDocument = usePDFDocument({
      url,
      onDocumentLoadSuccess,
      onDocumentLoadFailure,
    });
    const [currentPageNumber, setCurrentPageNumber] =
      useState<number>(initialPage);
    const [scale, setScale] = useState<number>(DEFAULT_SCALE);
    const [defaultViewportWidth, setDefaultViewportWidth] = useState<number>(0);
    const [defaultViewportHeight, setDefaultViewportHeight] =
      useState<number>(0);
    const [enableScroll, setEnableScroll] = useState<boolean>(false);
    const onEnableScrollChange = React.useCallback((enable: boolean) => {
      setEnableScroll(enable);
    }, []);
    // TODO: enable text layer should be based on user status
    const enableTextLayer = false;
    const [showLayoutAnalysis, setShowLayoutAnalysis] =
      useState<boolean>(false);
    const onShowLayoutAnalysisChange = React.useCallback((show: boolean) => {
      setShowLayoutAnalysis(show);
    }, []);

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

    React.useImperativeHandle(ref, () => {
      return {
        goToPage: (pageNum: number) => {
          setCurrentPageNumber(pageNum);
        },
      };
    });

    return (
      <PDFViewerContext.Provider value={{ showLayoutAnalysis }}>
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
            showLayoutAnalysis={showLayoutAnalysis}
            onShowLayoutAnalysisChange={onShowLayoutAnalysisChange}
          />
          {pdfDocument ? (
            enableScroll ? (
              <PDFPageScrollView
                ref={sceneRef}
                onPageChange={(pageNum) => {
                  setCurrentPageNumber(pageNum);
                }}
                spaceKey={spaceKey}
                documentPath={documentPath}
                document={pdfDocument}
                scale={scale}
                currentPageNumber={currentPageNumber}
                onRenderCompleted={handleRenderPageCompleted}
                enableTextLayer={enableTextLayer}
              />
            ) : (
              <div
                data-test="pdfViewer-scene"
                ref={sceneRef}
                className={styles.scene}
              >
                <PDFPage
                  spaceKey={spaceKey}
                  documentPath={documentPath}
                  pageNumber={currentPageNumber}
                  scale={scale}
                  onRenderCompleted={handleRenderPageCompleted}
                  document={pdfDocument}
                  enableTextLayer={enableTextLayer}
                  style={{
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    marginTop: 'auto',
                    marginBottom: 'auto',
                  }}
                />
              </div>
            )
          ) : null}
        </div>
      </PDFViewerContext.Provider>
    );
  }
);
