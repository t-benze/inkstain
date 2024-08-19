import * as React from 'react';
import { tokens, PositioningImperativeRef } from '@fluentui/react-components';
import { Annotation } from '@inkstain/client-api';

interface SelectionProps {
  initRect: DOMRect;
  element: SVGGraphicsElement;
  positionRef: React.MutableRefObject<PositioningImperativeRef | null>;
  annotation: Annotation;
  onSelectionChange?: (selectedBox: DOMRect) => void;
}

export interface SelectionImperativeRef {
  updateRect(rect: DOMRect): void;
}

export const Selection = React.forwardRef<
  SelectionImperativeRef,
  SelectionProps
>(({ annotation, initRect, positionRef, element }, ref) => {
  const color = tokens.colorBrandBackground;
  const svgRef = React.useRef<SVGSVGElement | null>(null);
  const [rect, setRect] = React.useState(initRect);
  const circleRadius = 10;
  const margin = 1;
  const originX = rect.x - (circleRadius + margin);
  const originY = rect.y - (circleRadius + margin);
  const isLine = annotation.data.shape === 'line';
  const isPen = annotation.data.shape === 'pen';

  React.useEffect(() => {
    setRect(initRect);
  }, [initRect]);

  React.useEffect(() => {
    if (positionRef.current) {
      positionRef.current.setTarget(svgRef.current);
    }
  }, [positionRef, svgRef]);

  React.useImperativeHandle(ref, () => ({
    updateRect: (newRect: DOMRect) => {
      setRect(newRect);
    },
  }));

  const renderLineAnchors = () => {
    const line = element as SVGLineElement;
    const x1 = parseFloat(line.getAttribute('x1') ?? '0');
    const y1 = parseFloat(line.getAttribute('y1') ?? '0');
    const x2 = parseFloat(line.getAttribute('x2') ?? '0');
    const y2 = parseFloat(line.getAttribute('y2') ?? '0');
    const baseX = Math.min(x1, x2);
    const baseY = Math.min(y1, y2);
    return (
      <>
        <circle
          data-mode="resizingHead"
          cx={margin + circleRadius + (x1 - baseX)}
          cy={margin + circleRadius + (y1 - baseY)}
          r={circleRadius}
          fill="white"
          stroke={color}
          strokeWidth="2"
          style={{ cursor: 'grab' }}
        />
        <circle
          data-mode="resizingTail"
          cx={circleRadius + margin + (x2 - baseX)}
          cy={circleRadius + margin + (y2 - baseY)}
          r={circleRadius}
          fill="white"
          stroke={color}
          strokeWidth="2"
          style={{ cursor: 'grab' }}
        />
      </>
    );
  };

  const renderRectAnchors = () => {
    return (
      <>
        <circle
          data-mode="resizingNorthWest"
          cx={margin + circleRadius}
          cy={margin + circleRadius}
          r={circleRadius}
          fill="white"
          stroke={color}
          strokeWidth="2"
          style={{ cursor: 'nw-resize' }}
        />
        <circle
          data-mode="resizingWest"
          cx={circleRadius + margin + rect.width / 2}
          cy={circleRadius + margin}
          r={circleRadius}
          fill="white"
          stroke={color}
          strokeWidth="2"
          style={{ cursor: 'ns-resize' }}
        />
        <circle
          data-mode="resizingNorthEast"
          cx={circleRadius + margin + rect.width}
          cy={circleRadius + margin}
          r={circleRadius}
          fill="white"
          stroke={color}
          strokeWidth="2"
          style={{ cursor: 'ne-resize' }}
        />
        <circle
          data-mode="resizingEast"
          cx={circleRadius + margin + rect.width}
          cy={circleRadius + margin + rect.height / 2}
          r={circleRadius}
          fill="white"
          stroke={color}
          strokeWidth="2"
          style={{ cursor: 'ew-resize' }}
        />
        <circle
          data-mode="resizingSouthEast"
          cx={circleRadius + margin + rect.width}
          cy={circleRadius + margin + rect.height}
          r={circleRadius}
          fill="white"
          stroke={color}
          strokeWidth="2"
          style={{ cursor: 'se-resize' }}
        />
        <circle
          data-mode="resizingSouth"
          cx={circleRadius + margin + rect.width / 2}
          cy={circleRadius + margin + rect.height}
          r={circleRadius}
          fill="white"
          stroke={color}
          strokeWidth="2"
          style={{ cursor: 'ns-resize' }}
        />
        <circle
          data-mode="resizingSouthWest"
          cx={circleRadius + margin}
          cy={circleRadius + margin + rect.height}
          r={circleRadius}
          fill="white"
          stroke={color}
          strokeWidth="2"
          style={{ cursor: 'sw-resize' }}
        />
        <circle
          data-mode="resizingWest"
          cx={circleRadius + margin}
          cy={circleRadius + margin + rect.height / 2}
          r={circleRadius}
          fill="white"
          stroke={color}
          strokeWidth="2"
          style={{ cursor: 'ew-resize' }}
        />
      </>
    );
  };
  return (
    <svg
      ref={svgRef}
      width={`${rect.width + 2 * (circleRadius + margin)}`}
      x={originX}
      height={`${rect.height + 2 * (circleRadius + margin)}`}
      y={originY}
    >
      <rect
        pointerEvents={'all'}
        data-mode="moving"
        width={Math.max(rect.width, 1 * window.devicePixelRatio)}
        height={Math.max(rect.height, 1 * window.devicePixelRatio)}
        x={margin + circleRadius}
        y={margin + circleRadius}
        stroke={color}
        strokeWidth="2"
        fill="none"
        style={{ cursor: 'move' }}
      />
      {isLine ? renderLineAnchors() : !isPen ? renderRectAnchors() : null}
    </svg>
  );
});