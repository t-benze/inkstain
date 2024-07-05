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
import { Annotation, DrawingData } from '@inkstain/client-api';
import { PDFViewerContext } from '../context';
import { useTranslation } from 'react-i18next';
import { Selection, SelectionImperativeRef } from './Selection';

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

interface PDFPageDrawingLayerProps {
  scale: number;
  canvasDimension: { width: number; height: number } | null;
  drawings: Array<Annotation> | null;
  onUpdateAnnotation: (id: string, data: object, comment?: string) => void;
  onAddAnnotation: (data: object, comment?: string) => void;
  onRemoveAnnotation: (id: string) => void;
}

type Point = { x: number; y: number };
const calculateDistance = (point1: Point, point2: Point) => ({
  x: point2.x - point1.x,
  y: point2.y - point1.y,
});

const extractSVGShapeAttributes = (
  element: SVGGraphicsElement,
  scale: number
) => {
  const attributes: { [key: string]: string } = {};
  [
    'x',
    'y',
    'x1',
    'y1',
    'x2',
    'y2',
    'width',
    'height',
    'rx',
    'ry',
    'stroke',
    'stroke-width',
    'fill',
    'cx',
    'cy',
  ].forEach((attribute) => {
    const value = element.getAttribute(attribute);
    if (value) {
      const parsedValue = parseFloat(value);
      if (!isNaN(parsedValue)) {
        attributes[attribute] = (parseFloat(value) / scale).toFixed(2);
      } else {
        attributes[attribute] = value;
      }
    }
  });
  return attributes;
};
const retriveSVGShapeAttributes = (attributes: object, scale: number) => {
  const newAttributes: { [key: string]: string } = {};
  Object.entries(attributes).forEach(([key, value]) => {
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue)) {
      newAttributes[key] = (parseFloat(value) * scale).toFixed(2);
    } else {
      newAttributes[key] = value;
    }
  });
  return newAttributes;
};

const fitLineToRect = (line: SVGGraphicsElement, newRect: DOMRect) => {
  const y1 = parseFloat(line.getAttribute('y1') || '0');
  const y2 = parseFloat(line.getAttribute('y2') || '0');
  if (y1 > y2) {
    line.setAttribute('x1', `${newRect.x}`);
    line.setAttribute('y1', `${newRect.y + newRect.height}`);
    line.setAttribute('x2', `${newRect.x + newRect.width}`);
    line.setAttribute('y2', `${newRect.y}`);
  } else {
    line.setAttribute('x1', `${newRect.x}`);
    line.setAttribute('y1', `${newRect.y}`);
    line.setAttribute('x2', `${newRect.x + newRect.width}`);
    line.setAttribute('y2', `${newRect.y + newRect.height}`);
  }
};

const Drawing = ({
  drawing,
  scale,
}: {
  drawing: Annotation;
  scale: number;
}) => {
  const data = drawing.data as DrawingData;
  const attributes = retriveSVGShapeAttributes(data.attributes, scale);
  switch (data.shape) {
    case 'line': {
      return (
        <line
          data-annotation-id={drawing.id}
          pointerEvents={'bounding-box'}
          x1={attributes.x1}
          y1={attributes.y1}
          x2={attributes.x2}
          y2={attributes.y2}
          fill="none"
          stroke={attributes.stroke}
          strokeWidth={attributes['stroke-width']}
        />
      );
    }
    case 'rect': {
      return (
        <rect
          data-annotation-id={drawing.id}
          pointerEvents={'bounding-box'}
          width={attributes.width}
          height={attributes.height}
          x={attributes.x}
          y={attributes.y}
          fill="none"
          stroke={attributes.stroke}
          strokeWidth={attributes['stroke-width']}
        />
      );
    }
    case 'ellipse': {
      return (
        <ellipse
          data-annotation-id={drawing.id}
          pointerEvents={'all'}
          cx={attributes.cx}
          cy={attributes.cy}
          rx={attributes.rx}
          ry={attributes.ry}
          fill="none"
          stroke={attributes.stroke}
          strokeWidth={attributes['stroke-width']}
        />
      );
    }
    default: {
      return null;
    }
  }
};
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
        data-test="pdfViewer-drawingAnnotationComment"
        textarea={{ placeholder: t('pdfview.comment_optional') }}
        value={commentInner}
        onChange={(e) => setCommentInner(e.target.value)}
      />
      <div className={classes.drawingAnnotationPopoverBtns}>
        <Button
          data-test="pdfViewer-drawingAnnotationUpdateBtn"
          onClick={() => {
            onUpdateAnnotation(annotation.id, annotation.data, commentInner);
          }}
        >
          {t('update')}
        </Button>
        <Button
          data-test="pdfViewer-drawingAnnotationRemoveBtn"
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

type InteractionMode =
  | 'drawing'
  | 'resizingNorth'
  | 'resizingEast'
  | 'resizingSouth'
  | 'resizingWest'
  | 'resizingNorthEast'
  | 'resizingSouthEast'
  | 'resizingSouthWest'
  | 'resizingNorthWest'
  | 'moving';

export const PDFPageDrawingLayer = ({
  scale,
  canvasDimension,
  drawings,
  onAddAnnotation,
  onRemoveAnnotation,
  onUpdateAnnotation,
}: PDFPageDrawingLayerProps) => {
  const classes = useClasses();
  const svgcanvasRef = React.useRef<SVGSVGElement | null>(null);
  const startPointRef = React.useRef<SVGPoint | null>(null);
  const currentDrawingShapeRef = React.useRef<SVGElement | null>(null);
  const [interactionMode, setInteractionMode] =
    React.useState<InteractionMode | null>(null);
  const selectionImperativeRef = React.useRef<SelectionImperativeRef | null>(
    null
  );
  const pdfViewerContext = React.useContext(PDFViewerContext);
  const enableDrawing = pdfViewerContext.selectedStylus !== 'select';
  const strokeColor = pdfViewerContext.strokeColor;
  const strokeWidth = pdfViewerContext.strokeWidth.toString();

  const [selection, setSelection] = React.useState<{
    element: SVGGraphicsElement;
    initRect: DOMRect;
    annotation: Annotation;
  } | null>(null);

  const [openDrawingPopover, setOpenDrawingPopover] = React.useState(false);
  const popoverPositioningRef = React.useRef<PositioningImperativeRef | null>(
    null
  );
  React.useEffect(() => {
    if (selection) {
      const selected = drawings?.find((annotation) => {
        return annotation.id === selection.annotation.id;
      });
      if (!selected) {
        setSelection(null);
      } else {
        setSelection({
          ...selection,
          annotation: selected,
        });
      }
    }
  }, [drawings, selection]);

  const startDrawing = (svgPoint: DOMPoint) => {
    if (!enableDrawing) return;
    const shapeType = pdfViewerContext.selectedStylus;
    switch (shapeType) {
      case 'line':
        currentDrawingShapeRef.current = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'line'
        );
        currentDrawingShapeRef.current.setAttribute(
          'x1',
          svgPoint.x.toFixed(2)
        );
        currentDrawingShapeRef.current.setAttribute(
          'y1',
          svgPoint.y.toFixed(2)
        );
        currentDrawingShapeRef.current.setAttribute(
          'x2',
          svgPoint.x.toFixed(2)
        );
        currentDrawingShapeRef.current.setAttribute(
          'y2',
          svgPoint.y.toFixed(2)
        );
        break;

      case 'rect':
        currentDrawingShapeRef.current = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'rect'
        );
        currentDrawingShapeRef.current.setAttribute('x', svgPoint.x.toFixed(2));
        currentDrawingShapeRef.current.setAttribute('y', svgPoint.y.toFixed(2));
        currentDrawingShapeRef.current.setAttribute('width', '0');
        currentDrawingShapeRef.current.setAttribute('height', '0');
        break;
      case 'ellipse':
        currentDrawingShapeRef.current = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'ellipse'
        );
        currentDrawingShapeRef.current.setAttribute(
          'cx',
          svgPoint.x.toFixed(2)
        );
        currentDrawingShapeRef.current.setAttribute(
          'cy',
          svgPoint.y.toFixed(2)
        );
        currentDrawingShapeRef.current.setAttribute('rx', '0');
        currentDrawingShapeRef.current.setAttribute('ry', '0');
        break;
    }
    if (currentDrawingShapeRef.current) {
      currentDrawingShapeRef.current.setAttribute('fill', 'none');
      currentDrawingShapeRef.current.setAttribute('stroke', strokeColor);
      currentDrawingShapeRef.current.setAttribute('stroke-width', strokeWidth);
      svgcanvasRef.current?.appendChild(currentDrawingShapeRef.current);
    }
  };

  const drawingMove = (svgPoint: DOMPoint) => {
    if (
      !enableDrawing ||
      !svgcanvasRef.current ||
      !currentDrawingShapeRef.current ||
      !startPointRef.current
    )
      return;
    const currentShape = currentDrawingShapeRef.current;
    const startPoint = startPointRef.current;
    const shapeType = pdfViewerContext.selectedStylus;
    switch (shapeType) {
      case 'line': {
        currentShape.setAttribute('x2', svgPoint.x.toFixed(2));
        currentShape.setAttribute('y2', svgPoint.y.toFixed(2));
        break;
      }
      case 'rect': {
        const { x: xDistRect, y: yDistRect } = calculateDistance(
          startPoint,
          svgPoint
        );
        currentShape.setAttribute('width', Math.abs(xDistRect).toFixed(2));
        currentShape.setAttribute('height', Math.abs(yDistRect).toFixed(2));
        if (xDistRect < 0) {
          currentShape.setAttribute('x', (startPoint.x + xDistRect).toFixed(2));
        }
        if (yDistRect < 0) {
          currentShape.setAttribute('y', (startPoint.y + yDistRect).toFixed(2));
        }
        break;
      }
      case 'ellipse': {
        const { x: xDistEll, y: yDistEll } = calculateDistance(
          startPoint,
          svgPoint
        );
        currentShape.setAttribute('rx', Math.abs(xDistEll).toFixed(2));
        currentShape.setAttribute('ry', Math.abs(yDistEll).toFixed(2));
        break;
      }
    }
  };

  const drawingEnd = (e: React.MouseEvent) => {
    if (currentDrawingShapeRef.current) {
      const shapeType = pdfViewerContext.selectedStylus;
      let isValidShape = true;
      switch (shapeType) {
        case 'line': {
          const x1 = parseFloat(
            currentDrawingShapeRef.current.getAttribute('x1') || '0'
          );
          const x2 = parseFloat(
            currentDrawingShapeRef.current.getAttribute('x2') || '0'
          );
          const y1 = parseFloat(
            currentDrawingShapeRef.current.getAttribute('y1') || '0'
          );
          const y2 = parseFloat(
            currentDrawingShapeRef.current.getAttribute('y2') || '0'
          );
          if (Math.abs(x1 - x2) < 1 || Math.abs(y1 - y2) < 1) {
            isValidShape = false;
          } else if (x1 > x2) {
            currentDrawingShapeRef.current.setAttribute('x1', x2.toString());
            currentDrawingShapeRef.current.setAttribute('x2', x1.toString());
            currentDrawingShapeRef.current.setAttribute('y1', y2.toString());
            currentDrawingShapeRef.current.setAttribute('y2', y1.toString());
          }
          break;
        }
        case 'rect': {
          if (
            currentDrawingShapeRef.current.getAttribute('width') === '0' ||
            currentDrawingShapeRef.current.getAttribute('height') === '0'
          ) {
            isValidShape = false;
          }
          break;
        }
        case 'ellipse': {
          if (
            currentDrawingShapeRef.current.getAttribute('rx') === '0' ||
            currentDrawingShapeRef.current.getAttribute('ry') === '0'
          ) {
            isValidShape = false;
          }
          break;
        }
        default: {
          break;
        }
      }
      if (isValidShape) {
        onAddAnnotation({
          type: 'drawing',
          shape: shapeType,
          attributes: extractSVGShapeAttributes(
            currentDrawingShapeRef.current as SVGGraphicsElement,
            scale
          ),
        });
      }
      svgcanvasRef.current?.removeChild(currentDrawingShapeRef.current);
      currentDrawingShapeRef.current = null;
    }
  };

  const movingMove = (svgPoint: DOMPoint) => {
    if (selection) {
      const dx = svgPoint.x - startPointRef.current!.x;
      const dy = svgPoint.y - startPointRef.current!.y;
      const newRect = new DOMRect(
        selection.initRect.x + dx,
        selection.initRect.y + dy,
        selection.initRect.width,
        selection.initRect.height
      );
      selectionImperativeRef.current?.updateRect(newRect);
      switch (selection.annotation.data.shape) {
        case 'line': {
          fitLineToRect(selection.element, newRect);
          break;
        }
        case 'rect': {
          selection.element.setAttribute('x', `${selection.initRect.x + dx}`);
          selection.element.setAttribute('y', `${selection.initRect.y + dy}`);
          break;
        }
        case 'ellipse': {
          selection.element.setAttribute(
            'cx',
            `${newRect.x + newRect.width / 2}`
          );
          selection.element.setAttribute(
            'cy',
            `${newRect.y + newRect.height / 2}`
          );
        }
      }
    }
  };

  const resizingMove = (svgPoint: DOMPoint, mode: InteractionMode) => {
    if (!selection) return;
    const dx = svgPoint.x - startPointRef.current!.x;
    const dy = svgPoint.y - startPointRef.current!.y;
    const newRect = new DOMRect(
      selection.initRect.x,
      selection.initRect.y,
      selection.initRect.width,
      selection.initRect.height
    );
    switch (mode) {
      case 'resizingEast': {
        newRect.width += dx;
        break;
      }
      case 'resizingNorth': {
        newRect.y += dy;
        newRect.height -= dy;
        break;
      }
      case 'resizingSouth': {
        newRect.height += dy;
        break;
      }
      case 'resizingWest': {
        newRect.x += dx;
        newRect.width -= dx;
        break;
      }
      case 'resizingNorthEast': {
        newRect.y += dy;
        newRect.height -= dy;
        newRect.width += dx;
        break;
      }
      case 'resizingNorthWest': {
        newRect.x += dx;
        newRect.width -= dx;
        newRect.y += dy;
        newRect.height -= dy;
        break;
      }
      case 'resizingSouthEast': {
        newRect.width += dx;
        newRect.height += dy;
        break;
      }
      case 'resizingSouthWest': {
        newRect.x += dx;
        newRect.width -= dx;
        newRect.height += dy;
        break;
      }
    }
    selectionImperativeRef.current?.updateRect(newRect);
    switch (selection.annotation.data.shape) {
      case 'line': {
        fitLineToRect(selection.element, newRect);
        break;
      }
      case 'rect': {
        selection.element.setAttribute('x', `${newRect.x}`);
        selection.element.setAttribute('y', `${newRect.y}`);
        selection.element.setAttribute('width', `${newRect.width}`);
        selection.element.setAttribute('height', `${newRect.height}`);
        break;
      }
      case 'ellipse': {
        selection.element.setAttribute(
          'cx',
          `${newRect.x + newRect.width / 2}`
        );
        selection.element.setAttribute(
          'cy',
          `${newRect.y + newRect.height / 2}`
        );
        selection.element.setAttribute('rx', `${newRect.width / 2}`);
        selection.element.setAttribute('ry', `${newRect.height / 2}`);
        break;
      }
    }
  };

  const handleMouseDown: React.MouseEventHandler<SVGElement> = (e) => {
    if (e.button !== 0 || !svgcanvasRef.current) return;
    const svgCanvas = svgcanvasRef.current;
    const point = svgCanvas.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const startPoint = point.matrixTransform(
      svgCanvas.getScreenCTM()!.inverse()
    );
    startPointRef.current = startPoint;
    if (enableDrawing) {
      setInteractionMode('drawing');
      startDrawing(startPoint);
      if (selection) {
        setSelection(null);
      }
    } else {
      const target = e.target as SVGGraphicsElement;
      if (target.getAttribute('data-annotation-id') !== null) {
        const selectedAnnotation = drawings?.find((annotation) => {
          return annotation.id === target.getAttribute('data-annotation-id');
        });
        if (selectedAnnotation) {
          setSelection({
            element: target,
            initRect: target.getBBox(),
            annotation: selectedAnnotation,
          });
        }
      } else {
        if (selection) {
          if (target.getAttribute('data-mode') !== null) {
            setInteractionMode(
              target.getAttribute('data-mode') as InteractionMode
            );
          } else {
            setSelection(null);
          }
        }
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const point = svgcanvasRef.current!.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const svgPoint = point.matrixTransform(
      svgcanvasRef.current!.getScreenCTM()!.inverse()
    );
    switch (interactionMode) {
      case 'drawing': {
        drawingMove(svgPoint);
        break;
      }
      case 'moving': {
        movingMove(svgPoint);
        break;
      }
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
  };

  const handleMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
    console.log('mouse up', interactionMode, selection);
    switch (interactionMode) {
      case 'drawing': {
        drawingEnd(e);
        break;
      }
      case 'moving':
      case 'resizingEast':
      case 'resizingNorth':
      case 'resizingNorthEast':
      case 'resizingSouthEast':
      case 'resizingSouth':
      case 'resizingSouthWest':
      case 'resizingWest':
      case 'resizingNorthWest': {
        if (selection) {
          setSelection({
            ...selection,
            initRect: selection.element.getBBox(),
          });
          onUpdateAnnotation(
            selection.annotation.id,
            {
              ...selection.annotation.data,
              attributes: extractSVGShapeAttributes(selection.element, scale),
            },
            selection!.annotation.comment
          );
        }
        break;
      }
    }
    setInteractionMode(null);
  };
  // React.useEffect(() => {
  //   if(selection) {

  //   }

  // }, [])

  React.useEffect(() => {
    console.log('selection effect', selection, interactionMode);
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

  if (!canvasDimension) return null;
  // console.log('render page ', pageopenDrawingPopover);

  return (
    <Popover
      trapFocus
      open={openDrawingPopover}
      positioning={{ positioningRef: popoverPositioningRef }}
    >
      <svg
        data-test="pdfViewer-drawingLayer"
        viewBox={`0 0 ${canvasDimension.width} ${canvasDimension.height}`}
        className={classes.root}
        onMouseDown={pdfViewerContext.isThumbnail ? undefined : handleMouseDown}
        onMouseMove={pdfViewerContext.isThumbnail ? undefined : handleMouseMove}
        onMouseUp={pdfViewerContext.isThumbnail ? undefined : handleMouseUp}
        ref={svgcanvasRef}
        style={{ cursor: enableDrawing ? 'crosshair' : 'default' }}
      >
        {drawings?.map((drawing) => {
          const data = drawing.data as DrawingData;
          if (data.type !== 'drawing') return null;
          return <Drawing key={drawing.id} drawing={drawing} scale={scale} />;
        })}
        {selection && (
          <Selection
            ref={selectionImperativeRef}
            initRect={selection.initRect}
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
