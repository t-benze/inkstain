import * as React from 'react';
import { DrawingAnnotationOverlayContext } from '../context';
import { extractSVGShapeAttributes } from '../utils';

export const useDrawing = (
  scale: number,
  svgcanvasRef: React.RefObject<SVGSVGElement>,
  onAddAnnotation: (data: object, comment?: string) => void
) => {
  const drawingContext = React.useContext(DrawingAnnotationOverlayContext);
  const currentDrawingShapeRef = React.useRef<SVGElement | null>(null);
  const startPointRef = React.useRef<SVGPoint | null>(null);

  const startDrawing = (svgPoint: DOMPoint) => {
    const shapeType = drawingContext.selectedStylus;
    const strokeColor = drawingContext.strokeColor;
    const strokeWidth = drawingContext.strokeWidth.toString();

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
      case 'pen':
        currentDrawingShapeRef.current = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'path'
        );
        currentDrawingShapeRef.current.setAttribute(
          'd',
          `M${svgPoint.x.toFixed(2)},${svgPoint.y.toFixed(2)}`
        );
        currentDrawingShapeRef.current.setAttribute('stroke-linecap', 'round');
        currentDrawingShapeRef.current.setAttribute('stroke-linejoin', 'miter');
        break;
    }

    if (currentDrawingShapeRef.current) {
      currentDrawingShapeRef.current.setAttribute('fill', 'none');
      currentDrawingShapeRef.current.setAttribute('stroke', strokeColor);
      currentDrawingShapeRef.current.setAttribute('stroke-width', strokeWidth);
      svgcanvasRef.current?.appendChild(currentDrawingShapeRef.current);
    }

    startPointRef.current = svgPoint;
  };

  const drawingMove = (svgPoint: DOMPoint) => {
    if (!currentDrawingShapeRef.current || !startPointRef.current) return;

    const shapeType = drawingContext.selectedStylus;
    const startPoint = startPointRef.current;
    const dX = svgPoint.x - startPoint.x;
    const dY = svgPoint.y - startPoint.y;

    switch (shapeType) {
      case 'line':
        currentDrawingShapeRef.current.setAttribute(
          'x2',
          svgPoint.x.toFixed(2)
        );
        currentDrawingShapeRef.current.setAttribute(
          'y2',
          svgPoint.y.toFixed(2)
        );
        break;
      case 'rect': {
        currentDrawingShapeRef.current.setAttribute(
          'width',
          Math.abs(dX).toFixed(2)
        );
        currentDrawingShapeRef.current.setAttribute(
          'height',
          Math.abs(dY).toFixed(2)
        );
        if (dX < 0)
          currentDrawingShapeRef.current.setAttribute(
            'x',
            svgPoint.x.toFixed(2)
          );
        if (dY < 0)
          currentDrawingShapeRef.current.setAttribute(
            'y',
            svgPoint.y.toFixed(2)
          );
        break;
      }
      case 'ellipse':
        currentDrawingShapeRef.current.setAttribute(
          'rx',
          Math.abs(dX).toFixed(2)
        );
        currentDrawingShapeRef.current.setAttribute(
          'ry',
          Math.abs(dY).toFixed(2)
        );
        break;
      case 'pen': {
        const currentPath =
          currentDrawingShapeRef.current.getAttribute('d') || '';
        currentDrawingShapeRef.current.setAttribute(
          'd',
          `${currentPath} L${svgPoint.x.toFixed(2)},${svgPoint.y.toFixed(2)}`
        );
        break;
      }
    }
  };

  const drawingEnd = () => {
    if (!currentDrawingShapeRef.current) return;
    const currentElement = currentDrawingShapeRef.current;
    const shapeType = drawingContext.selectedStylus;
    let isValidShape = true;
    switch (shapeType) {
      case 'line': {
        const [x1, y1, x2, y2] = ['x1', 'y1', 'x2', 'y2'].map((attr) =>
          parseFloat(currentElement.getAttribute(attr) || '0')
        );
        if (Math.abs(x1 - x2) < 1 && Math.abs(y1 - y2) < 1) {
          isValidShape = false;
        } else if (x1 > x2) {
          currentDrawingShapeRef.current.setAttribute('x1', x1.toString());
          currentDrawingShapeRef.current.setAttribute('x2', x2.toString());
          currentDrawingShapeRef.current.setAttribute('y1', y1.toString());
          currentDrawingShapeRef.current.setAttribute('y2', y2.toString());
        }
        break;
      }
      case 'rect':
        if (
          currentElement.getAttribute('width') === '0' ||
          currentElement.getAttribute('height') === '0'
        ) {
          isValidShape = false;
        }
        break;
      case 'ellipse':
        if (
          currentElement.getAttribute('rx') === '0' ||
          currentElement.getAttribute('ry') === '0'
        ) {
          isValidShape = false;
        }
        break;
      case 'pen':
        if ((currentElement.getAttribute('d') || '').split(' ').length < 3) {
          isValidShape = false;
        }
        break;
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
    startPointRef.current = null;
  };

  return {
    startDrawing,
    drawingMove,
    drawingEnd,
  };
};
