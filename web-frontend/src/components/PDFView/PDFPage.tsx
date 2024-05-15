import {
  PDFDocumentProxy,
  RenderTask,
  // TextLayerRenderTask,
  RenderingCancelledException,
} from 'pdfjs-dist';
import * as React from 'react';
import { makeStyles } from '@fluentui/react-components';
import { documentsApi } from '~/web/apiClient';
import { AppContext } from '~/web/app/context';
import { PDFPageTextLayer } from './PDFPageTextLayer';

const useStyles = makeStyles({
  root: {
    position: 'relative',
  },
  canvas: {},
});

export const PDFPage = ({
  spaceKey,
  documentPath,
  document,
  pageNumber,
  scale,
  onRenderCompleted,
  role,
  ariaSetSize,
  ariaPosinset,
  style,
  enableTextLayer = true,
  onClick,
}: {
  spaceKey: string;
  documentPath: string;
  document: PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  onRenderCompleted?: (
    pageNumber: number,
    viewport: { width: number; height: number }
  ) => void;
  role?: string;
  ariaSetSize?: number;
  ariaPosinset?: number;
  style?: object;
  enableTextLayer?: boolean;
  onClick?: (pageNum: number) => void;
}) => {
  const styles = useStyles();
  const pageRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const renderTaskRef = React.useRef<RenderTask | null>(null);
  const appContext = React.useContext(AppContext);
  // const textLayerRef = React.useRef<HTMLDivElement>(null);
  // const textRenderTaskRef = React.useRef<TextLayerRenderTask | null>(null);
  // const textDivsRef = React.useRef<HTMLDivElement[]>([]);
  // const textDivPropertiesRef = React.useRef<WeakMap<HTMLElement, object>>(
  //   new WeakMap()
  // );
  // const textContentItemsStrRef = React.useRef<string[]>([]);
  // const isTextLayerRendered = React.useRef(false);

  React.useEffect(() => {
    document.getPage(pageNumber).then(async (pdfPage) => {
      const viewport = pdfPage.getViewport({ scale });
      const canvas = canvasRef.current;
      const pageDiv = pageRef.current;
      const outputScale = window.devicePixelRatio || 1;
      if (!canvas) throw new Error('Canvas not found');
      if (!pageDiv) throw new Error('Page div not found');
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas context not found');
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      const widthSize = Math.floor(viewport.width).toFixed(0);
      const widthHeight = Math.floor(viewport.height).toFixed(0);
      canvas.style.width = `${widthSize}px`;
      canvas.style.height = `${widthHeight}px`;
      pageDiv.style.width = `${widthSize}px`;
      pageDiv.style.height = `${widthHeight}px`;
      const transform =
        outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
      renderTaskRef.current = pdfPage.render({
        transform,
        canvasContext: context,
        viewport,
      });
      try {
        await renderTaskRef.current.promise;
        onRenderCompleted?.(pageNumber, viewport);
      } catch (e) {
        if (e instanceof RenderingCancelledException) {
          console.log('Rendering cancelled, page number: ', pageNumber);
        } else {
          throw e;
        }
      }
    });
    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [
    enableTextLayer,
    document,
    pageNumber,
    scale,
    onRenderCompleted,
    appContext.activeSpace,
    appContext.activeDocument,
  ]);

  return (
    <div
      role={role}
      ref={pageRef}
      className={styles.root}
      style={style}
      onClick={(e) => {
        e.preventDefault();
        onClick?.(pageNumber);
      }}
    >
      <canvas
        aria-posinset={ariaPosinset}
        aria-setsize={ariaSetSize}
        className={styles.canvas}
        data-test="pdfViewer-canvas"
        ref={canvasRef}
      />
      {enableTextLayer ? (
        <PDFPageTextLayer
          canvasRef={canvasRef}
          spaceKey={spaceKey}
          documentPath={documentPath}
          pageNum={pageNumber}
        />
      ) : null}
    </div>
  );
};
