import {
  PDFDocumentProxy,
  RenderTask,
  PDFPageProxy,
  TextLayerRenderTask,
  renderTextLayer,
} from 'pdfjs-dist';
import * as React from 'react';
import { makeStyles, shorthands, tokens } from '@fluentui/react-components';
// import {
//   normalizeUnicode,
//   renderTextLayer,
//   updateTextLayer,
//   TextContent,
// } from 'pdfjs-dist';
// import { TextContent } from 'pdfjs-dist/types/display/api';

const useStyles = makeStyles({
  root: {
    position: 'relative',
    ...shorthands.margin('auto'),
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
        if (!textLayerRef.current) throw new Error('text layer ref not found');
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
      } catch (e) {
        console.error('error rendering page', e);
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
  }, [document, pageNumber, scale, onRenderCompleted]);

  return (
    <div role={role} ref={pageRef} className={styles.root} style={style}>
      <canvas
        aria-posinset={ariaPosinset}
        aria-setsize={ariaSetSize}
        className={styles.canvas}
        data-test="pdfViewer-canvas"
        ref={canvasRef}
      />
      <div ref={textLayerRef} className={`${styles.textLayer} textLayer`} />
    </div>
  );
};
