import * as React from 'react';
import {
  translatePath,
  fitLineToRect,
  extractSVGShapeAttributes,
} from '../utils';
import type { InteractionMode } from '../types';
import type { Annotation } from '@inkstain/client-api';
import type { SelectionImperativeRef } from '../Selection';

export const useSelection = (
  scale: number,
  drawings: Array<Annotation> | null,
  highlights: Array<Annotation> | null,
  onInteractionModeChange: (mode: InteractionMode) => void,
  onUpdateAnnotation: (id: string, data: object, comment?: string) => void
) => {
  const startPointRef = React.useRef<DOMPoint | null>(null);
  const selectionImperativeRef = React.useRef<SelectionImperativeRef | null>(
    null
  );
  const [selection, setSelection] = React.useState<{
    element: SVGGraphicsElement;
    initRect: DOMRect;
    annotation: Annotation;
    isTextHighlight: boolean;
  } | null>(null);

  const startSelection = (svgPoint: DOMPoint, target: SVGGraphicsElement) => {
    startPointRef.current = svgPoint;
    let annotationID = target.getAttribute('data-annotation-id');
    if (annotationID !== null) {
      let actualTarget = target;
      if (annotationID.startsWith('shadow')) {
        annotationID = annotationID.replace('shadow-', '');
        actualTarget = document.querySelector(
          `[data-annotation-id="${annotationID}"]`
        ) as SVGGraphicsElement;
      }
      const isTextHighlight =
        target.getAttribute('data-text-highlight') === 'true';
      const selectedAnnotation = isTextHighlight
        ? highlights?.find((annotation) => {
            return annotation.id === annotationID;
          })
        : drawings?.find((annotation) => {
            return annotation.id === annotationID;
          });

      if (selectedAnnotation) {
        setSelection({
          element: actualTarget,
          initRect: actualTarget.getBBox(),
          annotation: selectedAnnotation,
          isTextHighlight: isTextHighlight,
        });
      }
    } else {
      // for selection sizing and moving (only drawing objects)
      if (selection) {
        if (target.getAttribute('data-mode') !== null) {
          onInteractionModeChange(
            target.getAttribute('data-mode') as InteractionMode
          );
        } else {
          setSelection(null);
        }
      }
    }
  };

  const movingMove = (svgPoint: DOMPoint) => {
    if (!startPointRef.current)
      throw new Error('startPointRef.current is null');
    if (selection) {
      const dx = svgPoint.x - startPointRef.current.x;
      const dy = svgPoint.y - startPointRef.current.y;
      const newRect = new DOMRect(
        selection.initRect.x + dx,
        selection.initRect.y + dy,
        selection.initRect.width,
        selection.initRect.height
      );
      selectionImperativeRef.current?.updateRect(newRect);
      selection.element.setAttribute('transform', `translate(${dx} ${dy})`);
    }
  };

  const movingEnd = (svgPoint: DOMPoint) => {
    if (!startPointRef.current)
      throw new Error('startPointRef.current is null');
    if (selection) {
      switch (selection.annotation.data.shape) {
        case 'line':
          {
            const x1 = parseFloat(selection.element.getAttribute('x1') || '0');
            const y1 = parseFloat(selection.element.getAttribute('y1') || '0');
            const x2 = parseFloat(selection.element.getAttribute('x2') || '0');
            const y2 = parseFloat(selection.element.getAttribute('y2') || '0');
            const dx = svgPoint.x - startPointRef.current.x;
            const dy = svgPoint.y - startPointRef.current.y;
            selection.element.setAttribute('x1', (x1 + dx).toFixed(2));
            selection.element.setAttribute('y1', (y1 + dy).toFixed(2));
            selection.element.setAttribute('x2', (x2 + dx).toFixed(2));
            selection.element.setAttribute('y2', (y2 + dy).toFixed(2));
          }
          break;
        case 'rect': {
          selection.element.setAttribute(
            'x',
            (svgPoint.x - selection.initRect.width / 2).toFixed(2)
          );
          selection.element.setAttribute(
            'y',
            (svgPoint.y - selection.initRect.height / 2).toFixed(2)
          );
          break;
        }
        case 'ellipse': {
          selection.element.setAttribute('cx', svgPoint.x.toFixed(2));
          selection.element.setAttribute('cy', svgPoint.y.toFixed(2));
          break;
        }
        case 'pen':
          {
            const dx = svgPoint.x - startPointRef.current.x;
            const dy = svgPoint.y - startPointRef.current.y;
            const newPath = translatePath(
              selection.annotation.data.attributes.d,
              dx,
              dy
            );
            selection.element.setAttribute('d', newPath);
          }
          break;
      }

      selection.element.removeAttribute('transform');
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
        selection.annotation.comment
      );
    }
  };

  const resizingMove = (svgPoint: DOMPoint, mode: InteractionMode) => {
    if (!startPointRef.current)
      throw new Error('startPointRef.current is null');
    if (!selection) throw new Error('selection is null');
    const dx = svgPoint.x - startPointRef.current.x;
    const dy = svgPoint.y - startPointRef.current.y;
    const newRect = new DOMRect(
      selection.initRect.x,
      selection.initRect.y,
      selection.initRect.width,
      selection.initRect.height
    );
    switch (mode) {
      case 'resizingHead': {
        selection.element.setAttribute('x1', svgPoint.x.toFixed(2));
        selection.element.setAttribute('y1', svgPoint.y.toFixed(2));
        break;
      }
      case 'resizingTail': {
        selection.element.setAttribute('x2', svgPoint.x.toFixed(2));
        selection.element.setAttribute('y2', svgPoint.y.toFixed(2));
        break;
      }
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
    switch (selection.annotation.data.shape) {
      case 'line': {
        const bbox = selection.element.getBBox();
        newRect.x = bbox.x;
        newRect.y = bbox.y;
        newRect.width = bbox.width;
        newRect.height = bbox.height;
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
    selectionImperativeRef.current?.updateRect(newRect);
  };

  const resizingEnd = () => {
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
        selection.annotation.comment
      );
    }
  };

  return {
    selection,
    setSelection,
    selectionImperativeRef,
    startSelection,
    movingMove,
    movingEnd,
    resizingMove,
    resizingEnd,
  };
};
