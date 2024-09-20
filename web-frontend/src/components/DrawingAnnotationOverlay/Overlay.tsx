import * as React from 'react';
import {
  Button,
  tokens,
  makeStyles,
  Popover,
  PopoverSurface,
  PositioningImperativeRef,
  Textarea,
} from '@fluentui/react-components';
import { Annotation, DrawingData, HighlightData } from '@inkstain/client-api';
import { DrawingAnnotationOverlayContext } from './context';
import { useTranslation } from 'react-i18next';
import { Selection } from './Selection';
import { InteractionMode } from './types';
import { useDrawing } from './hooks/useDrawing';
import { useSelection } from './hooks/useSelection';
import { Drawing } from './Drawing';
import { Highlight } from './Highlight';
import { useHighlight } from './hooks/useHighlight';

const useClasses = makeStyles({
  root: {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
  },
  drawingAnnotationPopover: {
    display: 'flex',
    flexDirection: 'column',
    width: '200px',
    '& .fui-Textarea': {
      marginBottom: tokens.spacingVerticalS,
    },
  },
  drawingAnnotationPopoverBtns: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

interface TextLineBoundingBox {
  height: number;
  left: number;
  top: number;
  width: number;
}

interface DrawingAnnotationOverlayProps {
  scale: number;
  dimension: { width: number; height: number } | null;
  drawings: Array<Annotation> | null;
  highlights: Array<Annotation> | null;
  textLines?: Array<TextLineBoundingBox>;
  onUpdateAnnotation: (id: string, data: object, comment?: string) => void;
  onAddAnnotation: (data: object, comment?: string) => void;
  onRemoveAnnotation: (id: string) => void;
}

const DrawingSelectionPopover = ({
  annotation,
  onRemoveAnnotation,
  onUpdateAnnotation,
}: {
  annotation: Annotation;
  onUpdateAnnotation: (id: string, data: object, comment?: string) => void;
  onRemoveAnnotation: (id: string) => void;
}) => {
  const classes = useClasses();
  const { t } = useTranslation();
  const [commentInner, setCommentInner] = React.useState(
    annotation.comment ?? ''
  );
  React.useEffect(() => {
    setCommentInner(annotation.comment ?? '');
  }, [annotation.comment]);
  return (
    <div className={classes.drawingAnnotationPopover}>
      <Textarea
        data-test="drawingAnnotationComment"
        textarea={{ placeholder: t('comment_optional') }}
        value={commentInner}
        onChange={(e) => setCommentInner(e.target.value)}
      />
      <div className={classes.drawingAnnotationPopoverBtns}>
        <Button
          data-test="drawingAnnotationUpdateBtn"
          onClick={() => {
            onUpdateAnnotation(annotation.id, annotation.data, commentInner);
          }}
        >
          {t('update')}
        </Button>
        <Button
          data-test="drawingAnnotationRemoveBtn"
          onClick={() => {
            onRemoveAnnotation(annotation.id);
          }}
        >
          {t('remove')}
        </Button>
      </div>
    </div>
  );
};

export const Overlay = ({
  scale,
  dimension,
  drawings,
  highlights,
  onAddAnnotation,
  onRemoveAnnotation,
  onUpdateAnnotation,
  textLines,
}: DrawingAnnotationOverlayProps) => {
  const classes = useClasses();
  const svgcanvasRef = React.useRef<SVGSVGElement | null>(null);
  const [interactionMode, setInteractionMode] =
    React.useState<InteractionMode | null>(null);
  const drawingContext = React.useContext(DrawingAnnotationOverlayContext);
  const { startDrawing, drawingMove, drawingEnd } = useDrawing(
    scale,
    svgcanvasRef,
    onAddAnnotation
  );
  const {
    selection,
    setSelection,
    selectionImperativeRef,
    startSelection,
    movingMove,
    movingEnd,
    resizingMove,
    resizingEnd,
  } = useSelection(
    scale,
    drawings,
    highlights,
    setInteractionMode,
    onUpdateAnnotation
  );
  const { startHighlight, highlightMove, highlightEnd } = useHighlight(
    scale,
    svgcanvasRef,
    textLines,
    onAddAnnotation
  );
  const isDrawing =
    drawingContext.selectedStylus === 'line' ||
    drawingContext.selectedStylus === 'rect' ||
    drawingContext.selectedStylus === 'ellipse' ||
    drawingContext.selectedStylus === 'pen';
  const isHighlight = drawingContext.selectedStylus === 'highlight';
  const [openDrawingPopover, setOpenDrawingPopover] = React.useState(false);
  const popoverPositioningRef = React.useRef<PositioningImperativeRef | null>(
    null
  );

  // Remove selection if it is not in the drawings, in case the annotation was removed
  React.useEffect(() => {
    if (selection) {
      const selected = selection.isTextHighlight
        ? highlights?.find((annotation) => {
            return annotation.id === selection.annotation.id;
          })
        : drawings?.find((annotation) => {
            return annotation.id === selection.annotation.id;
          });
      if (!selected) {
        setSelection(null);
      }
    }
  }, [drawings, highlights, selection, setSelection]);

  const convertDOMPointToSVGPoint = React.useCallback(
    (clientX: number, clientY: number) => {
      const svgCanvas = svgcanvasRef.current;
      if (!svgCanvas) throw new Error('SVGCanvas is null');
      const point = svgCanvas.createSVGPoint();
      const matrix = svgCanvas.getScreenCTM();
      point.x = clientX;
      point.y = clientY;
      if (!matrix) throw new Error('ScreenCTM is null');
      return point.matrixTransform(matrix.inverse());
    },
    []
  );

  const handleMouseDown: React.MouseEventHandler<SVGElement> = (e) => {
    e.stopPropagation();
    if (!drawingContext.enable || e.button !== 0 || !svgcanvasRef.current)
      return;
    const startPoint = convertDOMPointToSVGPoint(e.clientX, e.clientY);
    if (isHighlight) {
      // at highlight mode, when click on the highlight, it will be selected
      const target = e.target as SVGGElement;
      if (target.getAttribute('data-text-highlight') === 'true') {
        startSelection(startPoint, target);
      } else {
        startHighlight(startPoint);
        if (selection) {
          setSelection(null);
        }
      }
    } else if (isDrawing) {
      setInteractionMode('drawing');
      startDrawing(startPoint);
      if (selection) {
        setSelection(null);
      }
    } else {
      const target = e.target as SVGGraphicsElement;
      startSelection(startPoint, target);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    e.stopPropagation();
    if (!drawingContext.enable || !svgcanvasRef.current) return;
    const svgPoint = convertDOMPointToSVGPoint(e.clientX, e.clientY);
    if (isHighlight) {
      highlightMove(svgPoint);
    } else {
      switch (interactionMode) {
        case 'drawing': {
          drawingMove(svgPoint);
          break;
        }
        case 'moving': {
          movingMove(svgPoint);
          break;
        }
        case 'resizingHead':
        case 'resizingTail':
        case 'resizingEast':
        case 'resizingNorth':
        case 'resizingSouth':
        case 'resizingWest':
        case 'resizingNorthEast':
        case 'resizingSouthEast':
        case 'resizingSouthWest':
        case 'resizingNorthWest': {
          resizingMove(svgPoint, interactionMode);
          break;
        }
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
    e.stopPropagation();
    if (!drawingContext.enable) return;
    const svgPoint = convertDOMPointToSVGPoint(e.clientX, e.clientY);
    if (isHighlight) {
      highlightEnd();
    } else {
      switch (interactionMode) {
        case 'drawing': {
          drawingEnd();
          break;
        }
        case 'moving': {
          movingEnd(svgPoint);
          break;
        }
        case 'resizingHead':
        case 'resizingTail':
        case 'resizingEast':
        case 'resizingNorth':
        case 'resizingNorthEast':
        case 'resizingSouthEast':
        case 'resizingSouth':
        case 'resizingSouthWest':
        case 'resizingWest':
        case 'resizingNorthWest': {
          resizingEnd();
          break;
        }
      }
      setInteractionMode(null);
    }
  };

  // Open the popover if there's an active selection.
  React.useEffect(() => {
    if (interactionMode === null) {
      if (selection) {
        setOpenDrawingPopover(true);
      } else {
        setOpenDrawingPopover(false);
      }
    } else {
      setOpenDrawingPopover(false);
    }
  }, [selection, interactionMode]);

  if (!dimension) return null;

  return (
    <Popover
      trapFocus
      open={openDrawingPopover}
      positioning={{ positioningRef: popoverPositioningRef }}
    >
      <svg
        data-test="annotationOverlay-canvas"
        viewBox={`0 0 ${dimension.width} ${dimension.height}`}
        className={classes.root}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        ref={svgcanvasRef}
        style={{
          cursor: isHighlight ? 'text' : isDrawing ? 'crosshair' : 'default',
        }}
      >
        {drawings?.map((drawing) => {
          return <Drawing key={drawing.id} drawing={drawing} scale={scale} />;
        })}
        {highlights?.map((highlight) => {
          return (
            <Highlight key={highlight.id} highlight={highlight} scale={scale} />
          );
        })}
        {selection && (
          <Selection
            isTextHighlight={selection.isTextHighlight}
            annotation={selection.annotation}
            ref={selectionImperativeRef}
            initRect={selection.initRect}
            element={selection.element}
            positionRef={popoverPositioningRef}
          />
        )}
      </svg>
      <PopoverSurface>
        {selection ? (
          <DrawingSelectionPopover
            annotation={selection.annotation}
            onRemoveAnnotation={onRemoveAnnotation}
            onUpdateAnnotation={onUpdateAnnotation}
          />
        ) : null}
      </PopoverSurface>
    </Popover>
  );
};
