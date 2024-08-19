import {
  PDFDocumentProxy,
  RenderTask,
  RenderingCancelledException,
} from 'pdfjs-dist';
import * as React from 'react';
import {
  Popover,
  PopoverSurface,
  PopoverTrigger,
  Button,
  makeStyles,
  tokens,
  Textarea,
  PopoverProps,
  shorthands,
} from '@fluentui/react-components';
import { BookmarkFilled, BookmarkRegular } from '@fluentui/react-icons';
import { AppContext } from '~/web/app/context';
import { PDFPageTextLayer } from './PDFPageTextLayer';
import { PDFViewerContext } from './context';
import { useTranslation } from 'react-i18next';
import { Annotation, AnnotationData } from '@inkstain/client-api';
import { Overlay as PDFPageDrawingLayer } from '~/web/components/DrawingAnnotationOverlay';

const useClasses = makeStyles({
  root: {
    position: 'relative',
  },
  canvas: {},
  bookmartBtn: {
    position: 'absolute',
    top: '1%',
    right: '5%',
  },
  bookmarkPopover: {
    display: 'flex',
    flexDirection: 'column',
    width: '200px',
    '& .fui-Textarea': {
      marginBottom: tokens.spacingVerticalS,
    },
    '& .fui-Button': {
      ...shorthands.padding('0px', '0px'),
    },
  },
  bookmarkPopoverBtns: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

const BookmarkBtn = ({
  bookmark,
  onUpdateAnnotation,
  onAddAnnotation,
  onRemoveAnnotation,
}: {
  bookmark: Annotation | undefined;
  onUpdateAnnotation: (
    id: string,
    data: AnnotationData,
    comment?: string
  ) => void;
  onAddAnnotation: (data: AnnotationData, comment?: string) => void;
  onRemoveAnnotation: (id: string) => void;
}) => {
  const { t } = useTranslation();
  const classes = useClasses();
  const isBookmarked = bookmark !== undefined;
  const [commentInner, setCommentInner] = React.useState(
    bookmark?.comment ?? ''
  );
  React.useEffect(() => {
    setCommentInner(bookmark?.comment ?? '');
  }, [bookmark?.comment]);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const handleOpenChange: PopoverProps['onOpenChange'] = (_, data) => {
    setIsPopoverOpen(data.open);
  };
  return (
    <div className={classes.bookmartBtn}>
      <Popover
        positioning={'below'}
        open={isPopoverOpen}
        onOpenChange={handleOpenChange}
      >
        <PopoverTrigger>
          <div data-test="pdfViewer-bookmarkBtn">
            {isBookmarked ? (
              <BookmarkFilled
                fontSize={32}
                primaryFill={tokens.colorBrandBackground}
              />
            ) : (
              <BookmarkRegular fontSize={32} />
            )}
          </div>
        </PopoverTrigger>
        <PopoverSurface>
          <div className={classes.bookmarkPopover}>
            <Textarea
              data-test="pdfViewer-bookmarkComment"
              value={commentInner}
              textarea={{ placeholder: t('pdfview.comment_optional') }}
              onChange={(_, data) => setCommentInner(data.value)}
            ></Textarea>
            <div className={classes.bookmarkPopoverBtns}>
              {isBookmarked && (
                <Button
                  data-test="pdfViewer-bookmarkUpdateBtn"
                  onClick={(_) => {
                    bookmark &&
                      onUpdateAnnotation(
                        bookmark.id,
                        {
                          type: 'bookmark',
                        },
                        commentInner
                      );
                  }}
                >
                  {t('update')}
                </Button>
              )}
              {isBookmarked && (
                <Button
                  data-test="pdfViewer-bookmarkRemoveBtn"
                  onClick={(_) => {
                    onRemoveAnnotation(bookmark.id);
                    setIsPopoverOpen(false);
                  }}
                >
                  {t('remove')}
                </Button>
              )}
              {!isBookmarked && (
                <Button
                  data-test="pdfViewer-bookmarkAddBtn"
                  onClick={(e) => {
                    onAddAnnotation(
                      {
                        type: 'bookmark',
                      },
                      commentInner
                    );
                    setIsPopoverOpen(false);
                  }}
                >
                  {t('pdfview.bookmark')}
                </Button>
              )}
            </div>
          </div>
        </PopoverSurface>
      </Popover>
    </div>
  );
};

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
  enableTextLayer = false,
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
  const classes = useClasses();
  const pageRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const renderTaskRef = React.useRef<RenderTask | null>(null);
  const appContext = React.useContext(AppContext);
  const pdfViewerContext = React.useContext(PDFViewerContext);
  const [canvasDimension, setCanvasDimension] = React.useState<{
    width: number;
    height: number;
  } | null>(null);

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
      setCanvasDimension({
        width: canvas.width,
        height: canvas.height,
      });
      const widthCSS = Math.floor(viewport.width).toFixed(0);
      const heightCSS = Math.floor(viewport.height).toFixed(0);
      canvas.style.width = `${widthCSS}px`;
      canvas.style.height = `${heightCSS}px`;
      pageDiv.style.width = `${widthCSS}px`;
      pageDiv.style.height = `${heightCSS}px`;
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

  const handleAddAnnotation = React.useCallback(
    (data: AnnotationData, comment?: string) => {
      pdfViewerContext.addAnnotation({
        id: '',
        page: pageNumber,
        data,
        comment,
      });
    },
    [pdfViewerContext, pageNumber]
  );
  const handleUpdateAnnotation = React.useCallback(
    (id: string, data: AnnotationData, comment?: string) => {
      pdfViewerContext.updateAnnotation({
        id: id,
        page: pageNumber,
        data,
        comment,
      });
    },
    [pdfViewerContext, pageNumber]
  );
  const handleDeleteAnnotation = React.useCallback(
    (id: string) => {
      pdfViewerContext.deleteAnnotations([id]);
    },
    [pdfViewerContext]
  );
  const annotations = pdfViewerContext.annotations[pageNumber];
  const bookmark = annotations?.find((a) => a.data.type === 'bookmark');
  const drawings = annotations
    ? annotations.filter((a) => a.data.type === 'drawing')
    : null;
  return (
    <div
      role={role}
      ref={pageRef}
      className={classes.root}
      style={style}
      data-page-number={pageNumber}
      onClick={(e) => {
        e.preventDefault();
        onClick?.(pageNumber);
      }}
    >
      <canvas
        aria-posinset={ariaPosinset}
        aria-setsize={ariaSetSize}
        className={classes.canvas}
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
      <PDFPageDrawingLayer
        scale={scale}
        drawings={drawings}
        dimension={canvasDimension}
        onAddAnnotation={handleAddAnnotation}
        onUpdateAnnotation={handleUpdateAnnotation}
        onRemoveAnnotation={handleDeleteAnnotation}
      />
      {!pdfViewerContext.isThumbnail && (
        <BookmarkBtn
          bookmark={bookmark}
          onAddAnnotation={handleAddAnnotation}
          onUpdateAnnotation={handleUpdateAnnotation}
          onRemoveAnnotation={handleDeleteAnnotation}
        />
      )}
    </div>
  );
};
