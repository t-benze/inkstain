import * as React from 'react';
import { DocumentLayoutTextBlock } from '@inkstain/client-api';
import { tokens } from '@fluentui/react-components';

export const useTextBlockDetection = (
  canvasDimension: { width: number; height: number },
  svgcanvasRef: React.RefObject<SVGSVGElement>,
  textBlocks: Array<DocumentLayoutTextBlock> | undefined
) => {
  const isShiftKeyPressed = React.useRef(false);
  const blockRef = React.useRef<SVGRectElement | null>(null);
  const [activeTextBlock, setActiveTextBlock] =
    React.useState<DocumentLayoutTextBlock | null>(null);

  const blockBoundingBox = React.useMemo(() => {
    return textBlocks
      ? textBlocks.map((block) => {
          return {
            id: block.id,
            text: block.text,
            height: block.boundingBox.height * canvasDimension.height,
            width: block.boundingBox.width * canvasDimension.width,
            left: block.boundingBox.left * canvasDimension.width,
            top: block.boundingBox.top * canvasDimension.height,
          };
        })
      : [];
  }, [textBlocks, canvasDimension]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      isShiftKeyPressed.current = e.shiftKey;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      isShiftKeyPressed.current = e.shiftKey;
      if (blockRef.current) {
        svgcanvasRef.current?.removeChild(blockRef.current);
        blockRef.current = null;
      }
    };
    document.body.addEventListener('keydown', handleKeyDown);
    document.body.addEventListener('keyup', handleKeyUp);
    return () => {
      document.body.removeEventListener('keydown', handleKeyDown);
      document.body.removeEventListener('keyup', handleKeyUp);
    };
  }, [svgcanvasRef]);

  const blockDetectionMove = (svgPoint: DOMPoint) => {
    const layoutBlock = blockBoundingBox.find((block) => {
      return (
        svgPoint.x >= block.left &&
        svgPoint.x <= block.left + block.width &&
        svgPoint.y >= block.top &&
        svgPoint.y <= block.top + block.height
      );
    });
    if (layoutBlock) {
      if (!blockRef.current) {
        blockRef.current = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'rect'
        );
        blockRef.current.setAttribute('fill', 'none');
        blockRef.current.setAttribute('stroke', tokens.colorBrandBackground);
        blockRef.current.setAttribute('stroke-width', '1');
        blockRef.current.setAttribute('pointer-events', 'all');
        blockRef.current.setAttribute('style', 'cursor: pointer;');
        blockRef.current.addEventListener('mousedown', (e) => {
          e.stopPropagation();
          const blockId = (e.target as SVGGElement).getAttribute(
            'data-block-id'
          );
          const block = blockBoundingBox?.find((block) => block.id === blockId);
          if (block) {
            setActiveTextBlock({
              id: block.id,
              text: block.text,
              boundingBox: {
                height: block.height,
                width: block.width,
                left: block.left,
                top: block.top,
              },
            });
            svgcanvasRef.current?.removeChild(e.target as SVGGElement);
            blockRef.current = null;
          }
        });
      }
      blockRef.current.setAttribute('data-block-id', layoutBlock.id);
      blockRef.current.setAttribute('x', layoutBlock.left.toString());
      blockRef.current.setAttribute('y', layoutBlock.top.toString());
      blockRef.current.setAttribute('width', layoutBlock.width.toString());
      blockRef.current.setAttribute('height', layoutBlock.height.toString());
      svgcanvasRef.current?.appendChild(blockRef.current);
    } else {
      if (blockRef.current) {
        svgcanvasRef.current?.removeChild(blockRef.current);
        blockRef.current = null;
      }
    }
  };

  return {
    activeTextBlock,
    blockDetectionMove,
    isCtrlKeyPressed: isShiftKeyPressed,
    setActiveTextBlock,
  };
};