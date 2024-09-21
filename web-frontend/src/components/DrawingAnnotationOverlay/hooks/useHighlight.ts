import * as React from 'react';
import { DrawingAnnotationOverlayContext } from '../context';
import { extractSVGShapeAttributes } from '../utils';
import { DocumentLayoutTextLine } from '@inkstain/client-api';

interface TextLineBoundingBox {
  height: number;
  left: number;
  top: number;
  width: number;
}

export const useHighlight = (
  scale: number,
  canvasDimension: { width: number; height: number },
  svgcanvasRef: React.RefObject<SVGSVGElement>,
  textLines: Array<DocumentLayoutTextLine> | undefined,
  onAddAnnotation: (data: object, comment?: string) => void
) => {
  const drawingContext = React.useContext(DrawingAnnotationOverlayContext);
  const startPointRef = React.useRef<SVGPoint | null>(null);
  const currentHighlightRef = React.useRef<SVGElement | null>(null);
  const existingHighlightsRef = React.useRef<
    Array<{ id: string; bbox: TextLineBoundingBox }>
  >([]);
  const textLineBoudingBox = React.useMemo(() => {
    return textLines?.map((line) => {
      return {
        id: line.id,
        height: line.boundingBox.height * canvasDimension.height,
        width: line.boundingBox.width * canvasDimension.width,
        left: line.boundingBox.left * canvasDimension.width,
        top: line.boundingBox.top * canvasDimension.height,
      };
    });
  }, [textLines, canvasDimension]);

  const startHighlight = (svgPoint: DOMPoint) => {
    const strokeColor = drawingContext.strokeColor;
    currentHighlightRef.current = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'g'
    );
    currentHighlightRef.current.setAttribute('opacity', '0.4');
    currentHighlightRef.current?.setAttribute('fill', strokeColor);
    svgcanvasRef.current?.appendChild(currentHighlightRef.current);
    startPointRef.current = svgPoint;
  };

  const highlightMove = (svgPoint: DOMPoint) => {
    if (!currentHighlightRef.current || !startPointRef.current) return;

    const startPoint = startPointRef.current;
    const dX = svgPoint.x - startPoint.x;
    const dY = svgPoint.y - startPoint.y;
    const rect = {
      left: Math.min(startPoint.x, svgPoint.x),
      top: Math.min(startPoint.y, svgPoint.y),
      width: Math.abs(dX),
      height: Math.abs(dY),
    };
    const overlappingRects: Array<{ id: string; bbox: TextLineBoundingBox }> =
      [];
    textLineBoudingBox?.forEach((bbox) => {
      if (
        !(
          bbox.left + bbox.width < rect.left ||
          bbox.left > rect.left + rect.width ||
          bbox.top + bbox.height < rect.top ||
          bbox.top > rect.top + rect.height
        )
      ) {
        const left = bbox.top < rect.top ? rect.left : bbox.left;
        const right =
          bbox.top + bbox.height > rect.top + rect.height
            ? rect.left + rect.width
            : bbox.left + bbox.width;
        overlappingRects.push({
          id: bbox.id,
          bbox: {
            height: bbox.height,
            top: bbox.top,
            left: left,
            width: right - left,
          },
        });
      }
    });
    const newRects = overlappingRects.filter((bbox) => {
      return !existingHighlightsRef.current.some(
        (existing) => existing.id === bbox.id
      );
    });
    const removedRects = existingHighlightsRef.current.filter((bbox) => {
      return !overlappingRects.some((existing) => existing.id === bbox.id);
    });
    newRects.forEach(({ id, bbox }) => {
      const rectElement = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'rect'
      );
      rectElement.setAttribute('data-id', id);
      rectElement.setAttribute('x', bbox.left.toString());
      rectElement.setAttribute('y', bbox.top.toString());
      rectElement.setAttribute('width', bbox.width.toString());
      rectElement.setAttribute('height', bbox.height.toString());
      currentHighlightRef.current?.appendChild(rectElement);
    });
    removedRects.forEach(({ id }) => {
      const rectElement = currentHighlightRef.current?.querySelector(
        `[data-id="${id}"]`
      );
      if (rectElement) {
        currentHighlightRef.current?.removeChild(rectElement);
      }
    });
    overlappingRects.forEach(({ id, bbox }) => {
      if (newRects.some((newRect) => newRect.id === id)) {
        return;
      }
      const rectElement = currentHighlightRef.current?.querySelector(
        `[data-id="${id}"]`
      );
      if (rectElement) {
        rectElement.setAttribute('x', bbox.left.toString());
        rectElement.setAttribute('y', bbox.top.toString());
        rectElement.setAttribute('width', bbox.width.toString());
        rectElement.setAttribute('height', bbox.height.toString());
      }
    });
    existingHighlightsRef.current = overlappingRects;
  };

  const highlightEnd = () => {
    if (currentHighlightRef.current) {
      svgcanvasRef.current?.removeChild(currentHighlightRef.current);
      const isValid = currentHighlightRef.current.childElementCount > 0;
      const children = currentHighlightRef.current.children;
      currentHighlightRef.current = null;
      if (isValid) {
        onAddAnnotation({
          type: 'highlight',
          fill: drawingContext.strokeColor,
          areas: Array.from(children).map((child) => ({
            id: child.getAttribute('data-id'),
            attributes: extractSVGShapeAttributes(
              child as SVGGraphicsElement,
              scale
            ),
          })),
        });
      }
    }
    startPointRef.current = null;
  };

  return {
    startHighlight,
    highlightMove,
    highlightEnd,
  };
};
