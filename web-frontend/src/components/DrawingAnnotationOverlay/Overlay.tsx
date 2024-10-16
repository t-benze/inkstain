import * as React from 'react';
import {
  tokens,
  makeStyles,
  Popover,
  PopoverSurface,
  PositioningImperativeRef,
} from '@fluentui/react-components';
import {
  Annotation,
  DocumentLayoutTextLine,
  DocumentLayoutTextBlock,
} from '@inkstain/client-api';
import { useAppContext } from '~/web/app/hooks/useAppContext';
import { DrawingAnnotationOverlayContext } from './context';
import { Selection, DrawingSelectionPopover } from './Selection';
import { ActiveTextBlock, ActiveTextBlockPopover } from './ActiveTextBlock';
import { InteractionMode } from './types';
import { useDrawing } from './hooks/useDrawing';
import { useSelection } from './hooks/useSelection';
import { Drawing } from './Drawing';
import { Highlight } from './Highlight';
import { useHighlight } from './hooks/useHighlight';
import { useTextBlockDetection } from './hooks/useTextBlockDetection';

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

interface DrawingAnnotationOverlayProps {
  scale: number;
  dimension: { width: number; height: number };
  drawings: Array<Annotation> | null;
  highlights: Array<Annotation> | null;
  textLines?: Array<DocumentLayoutTextLine>;
  textBlocks?: Array<DocumentLayoutTextBlock>;
  onUpdateAnnotation: (id: string, data: object, comment?: string) => void;
  onAddAnnotation: (data: object, comment?: string) => void;
  onRemoveAnnotation: (id: string) => void;
}

export const Overlay = ({
  scale,
  dimension,
  drawings,
  highlights,
  onAddAnnotation,
  onRemoveAnnotation,
  onUpdateAnnotation,
  textLines,
  textBlocks,
}: DrawingAnnotationOverlayProps) => {
  const classes = useClasses();
  const svgcanvasRef = React.useRef<SVGSVGElement | null>(null);
  const [interactionMode, setInteractionMode] =
    React.useState<InteractionMode | null>(null);
  const appContext = useAppContext();
  const isShiftKeyPressed = appContext.pressedKeys.has('shift');
  const overlayContext = React.useContext(DrawingAnnotationOverlayContext);
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
    dimension,
    svgcanvasRef,
    textLines,
    onAddAnnotation
  );
  const { blockDetectionMove, activeTextBlock, setActiveTextBlock } =
    useTextBlockDetection(dimension, svgcanvasRef, textBlocks);

  const isDrawing =
    overlayContext.selectedStylus === 'line' ||
    overlayContext.selectedStylus === 'rect' ||
    overlayContext.selectedStylus === 'ellipse' ||
    overlayContext.selectedStylus === 'pen';
  const isHighlight = overlayContext.selectedStylus === 'highlight';
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
    if (!overlayContext.enable || e.button !== 0 || !svgcanvasRef.current)
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
        if (activeTextBlock) {
          setActiveTextBlock(null);
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
      if (activeTextBlock) {
        setActiveTextBlock(null);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    e.stopPropagation();
    if (!overlayContext.enable || !svgcanvasRef.current) return;
    const svgPoint = convertDOMPointToSVGPoint(e.clientX, e.clientY);

    if (isShiftKeyPressed) {
      blockDetectionMove(svgPoint);
    } else if (isHighlight) {
      highlightMove(svgPoint);
    } else if (interactionMode) {
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
    if (!overlayContext.enable) return;
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

  React.useEffect(() => {
    if (activeTextBlock) {
      setOpenDrawingPopover(true);
    } else {
      setOpenDrawingPopover(false);
    }
  }, [activeTextBlock]);
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
            key={selection.annotation.id}
            isTextHighlight={selection.isTextHighlight}
            annotation={selection.annotation}
            ref={selectionImperativeRef}
            initRect={selection.initRect}
            element={selection.element}
            positionRef={popoverPositioningRef}
          />
        )}
        {activeTextBlock && (
          <ActiveTextBlock
            textBlock={activeTextBlock}
            positionRef={popoverPositioningRef}
          />
        )}
      </svg>
      <PopoverSurface>
        {selection && (
          <DrawingSelectionPopover
            annotation={selection.annotation}
            onRemoveAnnotation={onRemoveAnnotation}
            onUpdateAnnotation={onUpdateAnnotation}
          />
        )}
        {activeTextBlock && (
          <ActiveTextBlockPopover text={activeTextBlock.text} />
        )}
      </PopoverSurface>
    </Popover>
  );
};
