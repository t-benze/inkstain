import * as React from 'react';
import { DrawingAnnotationOverlayContext } from '../context';
import { extractSVGShapeAttributes } from '../utils';
import {
  DocumentLayoutTextLine,
  DocumentLayoutTextBlock,
} from '@inkstain/client-api';

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
  blocks: Array<DocumentLayoutTextBlock> | undefined,
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
  const blockBoudingBox = React.useMemo(() => {
    return blocks?.map((block) => {
      return {
        id: block.id,
        childrenIds: block.childrenIds,
        height: block.boundingBox.height * canvasDimension.height,
        width: block.boundingBox.width * canvasDimension.width,
        left: block.boundingBox.left * canvasDimension.width,
        top: block.boundingBox.top * canvasDimension.height,
      };
    });
  }, [blocks, canvasDimension]);

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
    const overlappingBlocks =
      blockBoudingBox?.filter((block) => {
        return !(
          block.left + block.width < rect.left ||
          block.left > rect.left + rect.width ||
          block.top + block.height < rect.top ||
          block.top > rect.top + rect.height
        );
      }) ?? [];

    const overlappingLineRects: Array<{
      id: string;
      bbox: TextLineBoundingBox;
    }> = [];

    textLineBoudingBox?.forEach((bbox) => {
      let isInBlock = false;
      overlappingBlocks.forEach((block) => {
        // check if the text line is in the block
        if (block.childrenIds.some((id) => id === bbox.id)) {
          isInBlock = true;
        }
      });
      // as long as the text line is in the intersected blocks, only need to
      // check if the text line is in the vertical range of the highlight
      if (
        isInBlock &&
        !(
          bbox.top + bbox.height < rect.top || bbox.top > rect.top + rect.height
        )
      ) {
        const left = bbox.top < rect.top ? rect.left : bbox.left;
        const right =
          bbox.top + bbox.height > rect.top + rect.height
            ? rect.left + rect.width
            : bbox.left + bbox.width;
        overlappingLineRects.push({
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
    const newRects = overlappingLineRects.filter((bbox) => {
      return !existingHighlightsRef.current.some(
        (existing) => existing.id === bbox.id
      );
    });
    const removedRects = existingHighlightsRef.current.filter((bbox) => {
      return !overlappingLineRects.some((existing) => existing.id === bbox.id);
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
    overlappingLineRects.forEach(({ id, bbox }) => {
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
    existingHighlightsRef.current = overlappingLineRects;
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
