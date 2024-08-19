import 'pdfjs-dist/webpack.mjs';
import * as React from 'react';
import { useState } from 'react';
import { tokens, makeStyles } from '@fluentui/react-components';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { useDocument } from '~/web/hooks/useDocument';
import { PDFToolbar } from './PDFToolbar';
import { PDFPage } from './PDFPage';
import { PDFPageScrollView } from './PDFPageScrollView';
import { usePDFDocument } from './hooks';
import { PDFViewerContext } from './context';
import './viewer.css';
import { useAnnotations } from '~/web/hooks/useAnnotations';
import {
  DrawingAnnotationOverlayContext,
  useStylus,
} from '~/web/components/DrawingAnnotationOverlay';
import { useZoomScale } from '~/web/components/ZoomToolbar';

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
    width: '100%',
    height: '0px',
    display: 'flex',
    flexGrow: 1,
    overflow: 'scroll scroll',
  },
});

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
    const [sceneDimension, setSceneDimension] = useState<{
      width: number;
      height: number;
    } | null>(null);
    const [contentDimesion, setContentDimension] = useState<{
      width: number;
      height: number;
    } | null>(null);

    const {
      scale,
      setScale,
      handleZoomIn,
      handleZoomOut,
      handleZoomFitHeight,
      handleZoomFitWidth,
      handleZoomGesture,
    } = useZoomScale(sceneDimension, contentDimesion);
    const [enableScroll, setEnableScroll] = useState<boolean>(false);
    const handleEnableScrollChange = React.useCallback((enable: boolean) => {
      setEnableScroll(enable);
    }, []);
    // TODO: enable text layer should be based on user status
    const enableTextLayer = false;
    const [showLayoutAnalysis, setShowLayoutAnalysis] =
      useState<boolean>(false);
    const handleShowLayoutAnalysisChange = React.useCallback(
      (show: boolean) => {
        setShowLayoutAnalysis(show);
      },
      []
    );
    const sceneRef = React.useRef<HTMLDivElement>(null);

    React.useLayoutEffect(() => {
      if (sceneRef.current) {
        setSceneDimension({
          width: sceneRef.current.clientWidth,
          height: sceneRef.current.clientHeight,
        });
      }
      const windowResizeHandler = () => {
        if (sceneRef.current) {
          setSceneDimension({
            width: sceneRef.current.clientWidth,
            height: sceneRef.current.clientHeight,
          });
        }
      };
      window.addEventListener('resize', windowResizeHandler);
      return () => {
        window.removeEventListener('resize', windowResizeHandler);
      };
    }, [sceneRef, pdfDocument, enableScroll]);

    const handleRenderPageCompleted = React.useCallback(
      (pageNum: number, viewport: { width: number; height: number }) => {
        if (pageNum === initialPage) {
          if (scale === 1 && !contentDimesion) {
            setContentDimension({
              width: viewport.width,
              height: viewport.height,
            });
          }
          sceneRef.current?.setAttribute('data-ready', 'true');
        }
      },
      [initialPage, contentDimesion, sceneRef, scale]
    );

    // automatically scale to pdf page to fit the viewport width
    const [hasAdjustedInitScale, setHasAdjustedInitScale] =
      React.useState<boolean>(false);
    React.useEffect(() => {
      if (hasAdjustedInitScale || !sceneDimension || !contentDimesion) return;
      setScale(sceneDimension.width / contentDimesion.width);
      sceneRef.current?.setAttribute('data-initialWidthAdjusted', 'true');
      setHasAdjustedInitScale(true);
    }, [sceneDimension, contentDimesion, hasAdjustedInitScale, setScale]);

    React.useImperativeHandle(ref, () => {
      return {
        goToPage: (pageNum: number) => {
          setCurrentPageNumber(pageNum);
        },
      };
    });

    const { annotations, addAnnotation, updateAnnotation, deleteAnnotations } =
      useAnnotations(spaceKey, documentPath);

    const {
      stylus,
      strokeColor,
      strokeWidth,
      handleStrokeColorChange,
      handleStrokeWidthChange,
      handleStylusChange,
    } = useStylus();

    // for high resolution devices, we need to scale the pdf rendering
    const pdfScale = scale * window.devicePixelRatio;
    return (
      <PDFViewerContext.Provider
        value={{
          showLayoutAnalysis,
          documentPath: documentPath,
          annotations: annotations ? annotations : {},
          addAnnotation: addAnnotation,
          updateAnnotation: updateAnnotation,
          deleteAnnotations: deleteAnnotations,
          isThumbnail: false,
        }}
      >
        <DrawingAnnotationOverlayContext.Provider
          value={{
            selectedStylus: stylus,
            strokeColor: strokeColor,
            strokeWidth: strokeWidth,
            enable: true,
            handleStrokeColorChange,
            handleStrokeWidthChange,
            handleStylusChange,
          }}
        >
          <div className={styles.root}>
            <PDFToolbar
              currentPage={currentPageNumber}
              numOfPages={pdfDocument?.numPages || 0}
              enableScroll={enableScroll}
              onEnableScrollChange={handleEnableScrollChange}
              onPageChange={(pageNum) => {
                setCurrentPageNumber(pageNum);
              }}
              onZoomFitHeight={handleZoomFitHeight}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onZoomFitWidth={handleZoomFitWidth}
              showLayoutAnalysis={showLayoutAnalysis}
              onShowLayoutAnalysisChange={handleShowLayoutAnalysisChange}
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
                  scale={pdfScale}
                  currentPageNumber={currentPageNumber}
                  onRenderCompleted={handleRenderPageCompleted}
                  enableTextLayer={enableTextLayer}
                  onZoomGesture={handleZoomGesture}
                />
              ) : (
                <div
                  data-initialWidthAdjusted
                  data-test="pdfViewer-scene"
                  onWheel={handleZoomGesture}
                  ref={sceneRef}
                  className={styles.scene}
                >
                  <PDFPage
                    spaceKey={spaceKey}
                    documentPath={documentPath}
                    pageNumber={currentPageNumber}
                    scale={pdfScale}
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
        </DrawingAnnotationOverlayContext.Provider>
      </PDFViewerContext.Provider>
    );
  }
);
