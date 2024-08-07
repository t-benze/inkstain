import * as React from 'react';
import { tokens, PositioningImperativeRef } from '@fluentui/react-components';

interface SelectionProps {
  initRect: DOMRect;
  positionRef: React.MutableRefObject<PositioningImperativeRef | null>;
  onSelectionChange?: (selectedBox: DOMRect) => void;
}

export interface SelectionImperativeRef {
  updateRect(rect: DOMRect): void;
}

export const Selection = React.forwardRef<
  SelectionImperativeRef,
  SelectionProps
>(({ initRect, positionRef }, ref) => {
  const color = tokens.colorBrandBackground;
  const svgRef = React.useRef<SVGSVGElement | null>(null);
  const [rect, setRect] = React.useState(initRect);
  const circleRadius = 10;
  const margin = 1;
  const originX = rect.x - (circleRadius + margin);
  const originY = rect.y - (circleRadius + margin);

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
        width={rect.width}
        height={rect.height}
        x={margin + circleRadius}
        y={margin + circleRadius}
        stroke={color}
        strokeWidth="2"
        fill="none"
        style={{ cursor: 'move' }}
      />
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
    </svg>
  );
});
