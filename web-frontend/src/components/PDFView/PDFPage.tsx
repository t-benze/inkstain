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
} from '@fluentui/react-components';
import { BookmarkFilled, BookmarkRegular } from '@fluentui/react-icons';
import { AppContext } from '~/web/app/context';
import { PDFPageTextLayer } from './PDFPageTextLayer';
import { PDFViewerContext } from './context';
import { useTranslation } from 'react-i18next';

const useClasses = makeStyles({
  root: {
    position: 'relative',
  },
  canvas: {},
  bookmartBtn: {
    position: 'absolute',
    top: '0px',
    right: '50px',
  },
  bookmarkPopover: {
    display: 'flex',
    flexDirection: 'column',
    width: '200px',
    '& .fui-Textarea': {
      marginBottom: tokens.spacingVerticalS,
    },
    '& .fui-Button': {},
  },
  bookmarkPopoverBtns: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

const BookmarkBtn = ({
  isBookmarked,
  comment,
  onUpdate,
  onAdd,
  onRemove,
}: {
  isBookmarked: boolean;
  comment?: string;
  onUpdate: (comment: string) => void;
  onAdd: (comment: string) => void;
  onRemove: () => void;
}) => {
  const { t } = useTranslation();
  const classes = useClasses();
  const [commentInner, setCommentInner] = React.useState(comment ?? '');
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
          <Button
            size="large"
            appearance="transparent"
            icon={
              isBookmarked ? (
                <BookmarkFilled primaryFill={tokens.colorBrandBackground} />
              ) : (
                <BookmarkRegular />
              )
            }
          />
        </PopoverTrigger>
        <PopoverSurface>
          <div className={classes.bookmarkPopover}>
            <Textarea
              value={commentInner}
              textarea={{ placeholder: 'Comment (optional)' }}
              onChange={(_, data) => setCommentInner(data.value)}
            ></Textarea>
            <div className={classes.bookmarkPopoverBtns}>
              {isBookmarked && (
                <Button
                  onClick={(_) => {
                    onUpdate(commentInner);
                    setIsPopoverOpen(false);
                  }}
                >
                  {t('update')}
                </Button>
              )}
              {isBookmarked && (
                <Button
                  onClick={(_) => {
                    onRemove();
                    setIsPopoverOpen(false);
                  }}
                >
                  {t('remove')}
                </Button>
              )}
              {!isBookmarked && (
                <Button
                  onClick={(e) => {
                    onAdd(commentInner);
                    setIsPopoverOpen(false);
                  }}
                >
                  {t('add')}
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
        const t = await pdfPage.getTextContent();
        console.log('text', t);
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

  const isBookMarked = pdfViewerContext.bookmarks[pageNumber] ? true : false;
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
      <BookmarkBtn
        comment={pdfViewerContext.bookmarks[pageNumber]?.comment}
        isBookmarked={isBookMarked}
        onAdd={(comment) => {
          pdfViewerContext.addAnnotation({
            data: {
              type: 'bookmark',
            },
            page: pageNumber,
            comment,
          });
        }}
        onUpdate={(comment) => {
          pdfViewerContext.updateAnnotation({
            data: {
              type: 'bookmark',
            },
            page: pageNumber,
            comment,
          });
        }}
        onRemove={() => {
          pdfViewerContext.deleteAnnotations([
            pdfViewerContext.bookmarks[pageNumber].id,
          ]);
        }}
      />
    </div>
  );
};
