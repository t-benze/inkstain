import {
  PDFDocumentProxy,
  RenderTask,
  TextLayerRenderTask,
  renderTextLayer,
  RenderingCancelledException,
} from 'pdfjs-dist';
import * as React from 'react';
import { makeStyles } from '@fluentui/react-components';

const useStyles = makeStyles({
  root: {
    position: 'relative',
  },
  textLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  canvas: {},
});

export const PDFPage = ({
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
  const textLayerRef = React.useRef<HTMLDivElement>(null);
  const textRenderTaskRef = React.useRef<TextLayerRenderTask | null>(null);
  const textDivsRef = React.useRef<HTMLDivElement[]>([]);
  const textDivPropertiesRef = React.useRef<WeakMap<HTMLElement, object>>(
    new WeakMap()
  );
  const textContentItemsStrRef = React.useRef<string[]>([]);

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
        if (enableTextLayer) {
          if (!textLayerRef.current)
            throw new Error('text layer ref not found');
          const readableStream = pdfPage.streamTextContent({
            includeMarkedContent: true,
            disableNormalization: true,
          });
          textRenderTaskRef.current = renderTextLayer({
            textContentSource: readableStream,
            container: textLayerRef.current,
            viewport,
            textDivs: textDivsRef.current,
            textDivProperties: textDivPropertiesRef.current,
            textContentItemsStr: textContentItemsStrRef.current,
          });
        }
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
      if (textRenderTaskRef.current) {
        textRenderTaskRef.current.cancel();
      }
    };
  }, [enableTextLayer, document, pageNumber, scale, onRenderCompleted]);

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
        <div ref={textLayerRef} className={`${styles.textLayer} textLayer`} />
      ) : null}
    </div>
  );
};
