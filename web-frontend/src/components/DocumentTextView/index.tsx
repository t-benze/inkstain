import * as React from 'react';
import {
  makeStyles,
  Body1,
  tokens,
  useToastController,
  Toast,
  ToastBody,
  useId,
} from '@fluentui/react-components';
import { WindowTextRegular } from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import { IntelligenceDocLayoutStatus200ResponseStatusEnum } from '@inkstain/client-api';
import { ToolbarButtonWithTooltip } from '~/web/components/Toolbar/Button';
import { useAppContext } from '~/web/app/hooks/useAppContext';
import { useDocumentText } from './hooks';

type DocumentTextViewProps = {
  spaceKey: string;
  documentPath: string;
  initBlockId?: string;
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
  },
});

export const DocumentTextView = React.forwardRef<
  DocumentTextViewHandle,
  DocumentTextViewProps
>(({ spaceKey, documentPath, initBlockId }, ref) => {
  const classes = useClasses();
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const containerId = useId();
  const { data } = useDocumentText(spaceKey, documentPath);
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

  return (
    <div className={classes.root} ref={containerRef}>
      {data
        ? data.textContent.map((text, index) => (
            <>
              <Body1 key={index} as={'pre'} id={`${containerId}-${index}`}>
                {text}
              </Body1>
              <br />
              <br />
            </>
          ))
        : null}
    </div>
  );
});

export const ToolbarTextViewButton = ({
  onShowTextView,
  showTextView,
  docLayoutStatus,
}: {
  showTextView: boolean;
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
          onShowTextView(!showTextView);
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
