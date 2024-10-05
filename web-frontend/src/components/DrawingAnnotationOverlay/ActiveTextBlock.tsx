import * as React from 'react';
import { tokens } from '@fluentui/react-components';
import {
  PositioningImperativeRef,
  makeStyles,
} from '@fluentui/react-components';
import { DocumentLayoutTextBlock } from '@inkstain/client-api';
import { useAppContext } from '~/web/app/hooks/useAppContext';

const useClasses = makeStyles({
  textContent: {
    userSelect: 'text',
    WebkitUserSelect: 'text',
    cursor: 'text',
  },
});

interface ActiveTextBlockProps {
  textBlock: DocumentLayoutTextBlock;
  positionRef: React.MutableRefObject<PositioningImperativeRef | null>;
}

// Text block that helps to position the popover containing the text content
export const ActiveTextBlock: React.FC<ActiveTextBlockProps> = ({
  textBlock,
  positionRef,
}) => {
  const blockRef = React.useRef<SVGRectElement | null>(null);
  React.useEffect(() => {
    if (positionRef.current) {
      positionRef.current.setTarget(blockRef.current);
    }
  }, [positionRef, blockRef]);
  return (
    <rect
      ref={blockRef}
      width={textBlock.boundingBox.width}
      height={textBlock.boundingBox.height}
      x={textBlock.boundingBox.left}
      y={textBlock.boundingBox.top}
      fill="none"
      stroke={tokens.colorBrandBackground}
      strokeWidth="2"
    />
  );
};

export const ActiveTextBlockPopover = ({ text }: { text: string }) => {
  const classes = useClasses();
  const preRef = React.useRef<HTMLPreElement | null>(null);
  const appContext = useAppContext();
  const keyDownHandler = (e: React.KeyboardEvent<HTMLPreElement>) => {
    // Allow: Ctrl+A, Ctrl+C, Ctrl+X (Windows) and Cmd+A, Cmd+C, Cmd+X (Mac)
    const allowedKeys = ['a', 'c', 'x'];
    if ((e.ctrlKey || e.metaKey) && allowedKeys.includes(e.key.toLowerCase())) {
      // These key combinations are allowed
      if (e.key.toLowerCase() === 'a') {
        e.preventDefault(); // Prevent default for Ctrl+A/Cmd+A
        const range = document.createRange();
        range.selectNodeContents(e.currentTarget);
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    } else {
      // Prevent all other keypresses
      e.preventDefault();
    }
  };
  React.useEffect(() => {
    const preElement = preRef.current;
    preElement?.focus();

    const keydownHandler = (e: KeyboardEvent) => {
      // Allow: Ctrl+A, Ctrl+C, Ctrl+X (Windows) and Cmd+A, Cmd+C, Cmd+X (Mac)
      const allowedKeys = ['a', 'c', 'x'];
      if (
        // target &&
        // target === preRef.current &&
        preRef.current &&
        (e.ctrlKey || e.metaKey) &&
        allowedKeys.includes(e.key.toLowerCase())
      ) {
        // These key combinations are allowed
        if (e.key.toLowerCase() === 'a') {
          e.preventDefault(); // Prevent default for Ctrl+A/Cmd+A
          const range = document.createRange();
          range.selectNodeContents(preRef.current);
          const selection = window.getSelection();
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      } else {
        // Prevent all other keypresses
        e.preventDefault();
      }
    };
    document.body.addEventListener('keydown', keydownHandler);
    return () => {
      preElement?.blur();
      document.body.removeEventListener('keydown', keydownHandler);
    };
  }, []);
  return (
    <pre
      data-test="layoutDetectionTextContent"
      ref={preRef}
      onKeyDown={keyDownHandler}
      onPaste={(e) => {
        e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
      }}
      className={classes.textContent}
    >
      {text}
    </pre>
  );
};
