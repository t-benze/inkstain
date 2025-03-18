import * as React from 'react';
import {
  makeStyles,
  Body1,
  tokens,
  useToastController,
  Toast,
  ToastBody,
  useId,
  Button,
} from '@fluentui/react-components';
import { WindowTextRegular, BotSparkleRegular } from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import { IntelligenceDocLayoutStatus200ResponseStatusEnum } from '@inkstain/client-api';
import { ToolbarButtonWithTooltip } from '~/web/components/Toolbar/Button';
import { useAppContext } from '~/web/app/hooks/useAppContext';
import { useDocumentText } from './hooks';
import { useDocumentContext } from '../DocumentView/hooks';

type DocumentTextViewProps = {
  spaceKey: string;
  documentPath: string;
  initBlockId?: string;
  openChatView: (quote?: string) => void;
};

type DocumentTextViewHandle = {
  goToBlock: (blockId: string) => void;
};
const useClasses = makeStyles({
  root: {
    width: '100%',
    height: '100%',
    overflowY: 'scroll',
    padding: tokens.spacingHorizontalM,
    boxSizing: 'border-box',
    position: 'relative',
  },
  textOverlayMask: {
    position: 'absolute',
    top: `32px`,
    left: 0,
    width: '20%',
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  textOverlay: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: 0,
    top: '32px',
    backgroundColor: tokens.colorNeutralBackground1,
  },
});

export const DocumentTextView = React.forwardRef<
  DocumentTextViewHandle,
  DocumentTextViewProps
>(({ spaceKey, documentPath, initBlockId, openChatView }, ref) => {
  const classes = useClasses();
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const containerId = useId();
  const { data } = useDocumentText(spaceKey, documentPath);
  const [selection, setSelection] = React.useState<{
    selectedText: string;
    positionLeft: number;
    positionTop: number;
  }>();
  const timeoutId = React.useRef<NodeJS.Timeout | null>(null);
  React.useImperativeHandle(ref, () => {
    return {
      goToBlock: (blockId: string) => {
        return;
      },
    };
  });
  React.useEffect(() => {
    if (data && initBlockId) {
      const targetBlockIndex = data.textBlockToOffset[initBlockId];
      const element = document.getElementById(
        `${containerId}-${targetBlockIndex}`
      );
      if (element) {
        if (timeoutId.current) {
          clearTimeout(timeoutId.current);
        }
        timeoutId.current = setTimeout(() => {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
            inline: 'nearest',
          });
          const selection = window.getSelection();
          if (selection) {
            selection.removeAllRanges();
            const range = new Range();
            range.selectNodeContents(element);
            selection.addRange(range);
          }
        }, 100);
      }
    }
  }, [data, initBlockId, containerId]);

  React.useEffect(() => {
    let debounceTimer: NodeJS.Timeout;
    const onSelectionChange = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const selection = window.getSelection();
        if (
          containerRef.current &&
          selection &&
          selection.rangeCount > 0 &&
          selection.toString().length > 0
        ) {
          const range = selection.getRangeAt(0);
          // Check if the selection is within the target div
          const startContainer = range.startContainer;
          const endContainer = range.endContainer;

          if (
            containerRef.current.contains(startContainer) &&
            containerRef.current.contains(endContainer)
          ) {
            let anchorNode = startContainer as HTMLElement;
            if (anchorNode.nodeType === Node.TEXT_NODE) {
              anchorNode = anchorNode.parentElement as HTMLElement;
            }
            const selectedText = selection.toString();
            const rect = anchorNode.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();
            setSelection({
              selectedText,
              positionLeft: rect.left - containerRect.left,
              positionTop:
                rect.top - containerRect.top + containerRef.current.scrollTop,
            });
          }
        } else {
          setSelection(undefined);
        }
      }, 300); // 300ms debounce delay
    };

    document.addEventListener('selectionchange', onSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', onSelectionChange);
      clearTimeout(debounceTimer);
    };
  }, []);

  return (
    <div className={classes.root} ref={containerRef}>
      {data
        ? data.textContent.map((text, index) => (
            <Body1 key={index} as={'pre'} id={`${containerId}-${index}`}>
              {text}
              <br />
              <br />
            </Body1>
          ))
        : null}
      {selection && (
        <Button
          style={{
            position: 'absolute',
            left: `${selection.positionLeft}px`,
            top: `${selection.positionTop}px`,
          }}
          onClick={() => {
            setSelection(undefined);
            openChatView(selection.selectedText);
          }}
          icon={<BotSparkleRegular />}
        ></Button>
      )}
    </div>
  );
});

export const ToolbarTextViewButton = ({
  onShowTextView,
  docLayoutStatus,
}: {
  onShowTextView: (show: boolean) => void;
  docLayoutStatus: IntelligenceDocLayoutStatus200ResponseStatusEnum | undefined;
}) => {
  const { t } = useTranslation();
  const { toasterId } = useAppContext();
  const { dispatchToast } = useToastController(toasterId);

  return (
    <ToolbarButtonWithTooltip
      onClick={() => {
        if (docLayoutStatus === 'completed') {
          onShowTextView(true);
        } else {
          // show error
          dispatchToast(
            <Toast>
              <ToastBody>{t('msg_require_doc_layout_for_text')}</ToastBody>
            </Toast>,
            {
              position: 'top',
              intent: 'error',
              timeout: 1500,
            }
          );
        }
      }}
      content={t('text_content')}
      icon={<WindowTextRegular />}
    />
  );
};

export const DocumentTextViewOverlay = ({
  show,
  closeTextOverlay,
  initBlockId,
  openChatView,
}: {
  show: boolean;
  initBlockId?: string;
  openChatView: (quote?: string) => void;
  closeTextOverlay: () => void;
}) => {
  const classes = useClasses();
  const { space, document } = useDocumentContext();
  return show ? (
    <>
      <div className={classes.textOverlayMask} onClick={closeTextOverlay} />
      <div className={classes.textOverlay}>
        <DocumentTextView
          initBlockId={initBlockId}
          spaceKey={space.key}
          documentPath={document.name}
          openChatView={openChatView}
        />
      </div>
    </>
  ) : null;
};

export { useDocumentText, useDocumentTextOverlay } from './hooks';
