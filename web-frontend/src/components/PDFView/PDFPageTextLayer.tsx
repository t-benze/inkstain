import * as React from 'react';
import {
  makeStyles,
  shorthands,
  Popover,
  PopoverTrigger,
  PopoverSurface,
  tokens,
} from '@fluentui/react-components';
import {
  DocumentTextDetectionDataInner,
  DocumentTextDetectionDataInnerGeometryBoundingBox,
} from '@inkstain/client-api';
import { PDFViewerContext } from './context';
import { useDocLayout } from '~/web/hooks/useDocLayout';
const useClasses = makeStyles({
  root: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    '& ::selection': {
      color: 'transparent',
      background: tokens.colorNeutralStencil1Alpha,
    },
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

function calculateFontSize(
  boundingBox: DocumentTextDetectionDataInnerGeometryBoundingBox,
  dimension: { width: number; height: number },
  charCount: number
): number {
  const width = dimension.width * (boundingBox.width ?? 0);
  // Approximate average character width in em units
  const avgCharWidth = 0.425; // This can be adjusted based on the font
  // Calculate total em units needed
  const totalEm = charCount * avgCharWidth;
  // Calculate font size
  const fontSize = width / totalEm;
  // Round down to nearest whole number
  return Math.floor(fontSize);
}

function toCSSPercentage(value: number): string {
  return `${value * 100}%`;
}

function boundingBoxStyle(
  boundingBox: DocumentTextDetectionDataInnerGeometryBoundingBox
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

const WordBlock = ({
  wordBlock,
  dimension,
}: {
  wordBlock: DocumentTextDetectionDataInner;
  dimension: { width: number; height: number };
}) => {
  const boundingBox = wordBlock.geometry?.boundingBox;
  const style = boundingBox ? boundingBoxStyle(boundingBox) : {};
  const fontSize = boundingBox
    ? calculateFontSize(boundingBox, dimension, wordBlock.text?.length ?? 1)
    : undefined;
  return (
    <div
      style={{ ...style, color: 'rgba(0,0,0,0)', textWrap: 'nowrap', fontSize }}
    >
      {wordBlock.text}
    </div>
  );
};

const LineBlock = ({
  lineBlock,
  dimension,
}: {
  lineBlock: DocumentTextDetectionDataInner;
  dimension: { width: number; height: number };
}) => {
  const boundingBox = lineBlock.geometry?.boundingBox;
  const style = boundingBox ? boundingBoxStyle(boundingBox) : {};
  const fontSize = boundingBox
    ? calculateFontSize(boundingBox, dimension, lineBlock.text?.length ?? 1)
    : undefined;
  return (
    <div style={{ ...style, cursor: 'text' }}>
      {/* {lineBlock.text}
      <br /> */}
    </div>
  );
};

const LayoutBlock = ({
  layoutBlock,
}: {
  layoutBlock: DocumentTextDetectionDataInner;
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
  spaceKey,
  documentPath,
  pageNum,
}: PDFPageTextLayerProps) => {
  const classes = useClasses();
  const data = useDocLayout({
    spaceKey,
    documentPath,
    pageNum,
  });
  const [dimension, setDimension] = React.useState<{
    width: number;
    height: number;
  } | null>(null);
  const divRef = React.useRef<HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    if (divRef.current) {
      setDimension({
        width: divRef.current.offsetWidth,
        height: divRef.current.offsetHeight,
      });
    }
  }, [divRef]);

  const renderBlocks = (dimension: { width: number; height: number }) => {
    const layoutBlocks = data
      ? data.layoutBlocks
          .filter((block) => block.blockType?.startsWith('LAYOUT'))
          .map((block) => <LayoutBlock layoutBlock={block} key={block.id} />)
      : [];
    const lineBlocks = data
      ? data.lineBlocks
          .filter((block) => block.blockType === 'LINE')
          .map((block) => (
            <LineBlock lineBlock={block} key={block.id} dimension={dimension} />
          ))
      : [];
    // const wordBlocks = data
    //   ? data.wordBlocks.map((block) => (
    //       <WordBlock wordBlock={block} key={block.id} dimension={dimension} />
    //     ))
    //   : [];
    const blocks = [...lineBlocks, ...layoutBlocks];
    return blocks;
  };
  return (
    <div ref={divRef} className={classes.root}>
      {dimension ? renderBlocks(dimension) : null}
    </div>
  );
};
