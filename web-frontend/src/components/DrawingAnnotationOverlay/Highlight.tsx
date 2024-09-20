import { Annotation, HighlightData } from '@inkstain/client-api';
import { restoreSVGShapeAttributes } from './utils';

interface HighlightProps {
  highlight: Annotation;
  scale: number;
}

export const Highlight = ({ highlight, scale }: HighlightProps) => {
  const data = highlight.data as HighlightData;
  return (
    <g
      fill={data.fill}
      pointerEvents={'all'}
      data-annotation-id={highlight.id}
      opacity={0.4}
    >
      {data.areas.map((area) => {
        const attributes = restoreSVGShapeAttributes(area.attributes, scale);
        return (
          <rect
            data-annotation-id={`shadow-${highlight.id}`}
            style={{ cursor: 'pointer' }}
            data-text-highlight={'true'}
            key={area.id}
            x={attributes.x}
            y={attributes.y}
            width={attributes.width}
            height={attributes.height}
          />
        );
      })}
    </g>
  );
};
