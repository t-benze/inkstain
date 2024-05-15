import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { documentsApi } from '~/web/apiClient';
import {
  makeStyles,
  shorthands,
  Popover,
  PopoverTrigger,
  PopoverSurface,
} from '@fluentui/react-components';
import {
  DocumentTextDetectionBlocksInner,
  DocumentTextDetectionBlocksInnerGeometryBoundingBox,
} from '@inkstain/client-api';
import { PDFViewerContext } from './context';
const useClasses = makeStyles({
  root: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
  layoutBlock: {
    ...shorthands.border('1px', 'solid', 'red'),
  },
});

interface PDFPageTextLayerProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  spaceKey: string;
  documentPath: string;
  pageNum: number;
}

function toCSSPercentage(value: number): string {
  return `${value * 100}%`;
}

function boundingBoxStyle(
  boundingBox: DocumentTextDetectionBlocksInnerGeometryBoundingBox
): React.CSSProperties {
  return {
    position: 'absolute',
    top: boundingBox.top ? toCSSPercentage(boundingBox.top) : undefined,
    left: boundingBox.left ? toCSSPercentage(boundingBox.left) : undefined,
    width: boundingBox.width ? toCSSPercentage(boundingBox.width) : undefined,
    height: boundingBox.height
      ? toCSSPercentage(boundingBox.height)
      : undefined,
  };
}

const LineBlock = ({
  lineBlock,
}: {
  lineBlock: DocumentTextDetectionBlocksInner;
}) => {
  const boundingBox = lineBlock.geometry?.boundingBox;
  const style = boundingBox ? boundingBoxStyle(boundingBox) : {};
  return (
    <div style={{ ...style, color: 'rgba(0,0,0,0)', textWrap: 'nowrap' }}>
      {lineBlock.text}
      <br />
    </div>
  );
};

const LayoutBlock = ({
  layoutBlock,
}: {
  layoutBlock: DocumentTextDetectionBlocksInner;
}) => {
  const context = React.useContext(PDFViewerContext);
  const classes = useClasses();
  const boundingBox = layoutBlock.geometry?.boundingBox;
  const style = boundingBox ? boundingBoxStyle(boundingBox) : {};
  return (
    <Popover openOnHover={true}>
      <PopoverTrigger>
        <div
          className={classes.layoutBlock}
          style={{
            ...style,
            display: context.showLayoutAnalysis ? 'block' : 'none',
          }}
        />
      </PopoverTrigger>
      <PopoverSurface tabIndex={-1}>
        <pre>{layoutBlock.text}</pre>
      </PopoverSurface>
    </Popover>
  );
};

export const PDFPageTextLayer = ({
  canvasRef,
  spaceKey,
  documentPath,
  pageNum,
}: PDFPageTextLayerProps) => {
  const classes = useClasses();
  const { data } = useQuery({
    queryKey: ['documentTextLayer', spaceKey, documentPath, pageNum],
    queryFn: async () => {
      if (canvasRef.current === null) {
        throw new Error('Canvas ref is null');
      }
      const base64Data = canvasRef.current
        .toDataURL('image/jpeg')
        .split(',')[1]; // Remove the data URL prefix
      const analyzedResult = await documentsApi.intelligenceAnalyzeDocument({
        spaceKey,
        path: documentPath,
        pageNum,
        body: base64Data,
        // mock: 1,
      });
      const blockIdToIndex: Record<string, number> = {};
      analyzedResult.blocks?.forEach((block, index) => {
        blockIdToIndex[block['id'] as string] = index;
      });
      const lineBlocks = analyzedResult.blocks
        ? analyzedResult.blocks.filter((block) => block.blockType === 'LINE')
        : [];
      const layoutBlocks = analyzedResult.blocks
        ? analyzedResult.blocks.filter((block) =>
            block.blockType?.startsWith('LAYOUT')
          )
        : [];
      layoutBlocks.forEach((block) => {
        const blocks = analyzedResult.blocks;
        if (!blocks) return;
        const children = block.relationships?.find((r) => r.type === 'CHILD');
        if (children) {
          block.text = children.ids
            ? children.ids
                .map((id) => {
                  const lineBlock = blocks[blockIdToIndex[id]];
                  return lineBlock.text;
                })
                .join('\n')
            : '';
        }
      });
      return {
        analyzedResult,
        blockIdToIndex,
        lineBlocks,
        layoutBlocks,
      };
    },
  });

  const layoutBlocks = data
    ? data.layoutBlocks
        .filter((block) => block.blockType?.startsWith('LAYOUT'))
        .map((block) => <LayoutBlock layoutBlock={block} key={block.id} />)
    : [];
  const lineBlocks = data
    ? data.lineBlocks
        .filter((block) => block.blockType === 'LINE')
        .map((block) => <LineBlock lineBlock={block} key={block.id} />)
    : [];
  const blocks = [...lineBlocks, ...layoutBlocks];
  return <div className={classes.root}>{blocks}</div>;
};
