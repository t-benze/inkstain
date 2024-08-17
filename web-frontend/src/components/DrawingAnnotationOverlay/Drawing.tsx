import type { Annotation, DrawingData } from '@inkstain/client-api';
import { StylusOption } from './types';
import { restoreSVGShapeAttributes } from './utils';

export const Drawing = ({
  drawing,
  scale,
}: {
  drawing: Annotation;
  scale: number;
}) => {
  const data = drawing.data as DrawingData;
  const attributes = restoreSVGShapeAttributes(data.attributes, scale);
  switch (data.shape as StylusOption) {
    case 'line': {
      return (
        <>
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
          <rect
            data-annotation-id={`shadow-${drawing.id}`}
            pointerEvents={'bounding-box'}
            x={attributes.x1}
            y={attributes.y1}
            width={Math.max(
              2 * window.devicePixelRatio,
              Math.abs(parseFloat(attributes.x2) - parseFloat(attributes.x1))
            )}
            height={Math.max(
              2 * window.devicePixelRatio,
              Math.abs(parseFloat(attributes.y2) - parseFloat(attributes.y1))
            )}
            fill="none"
            stroke="none"
            // strokeWidth={attributes['stroke-width']}
          />
        </>
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
    case 'pen':
      return (
        <path
          data-annotation-id={drawing.id}
          pointerEvents={'all'}
          d={attributes.d}
          fill="none"
          stroke={attributes.stroke}
          strokeWidth={attributes['stroke-width']}
          strokeLinecap="round"
          strokeLinejoin="miter"
        />
      );
    default: {
      return null;
    }
  }
};
