import * as React from 'react';
import { BotSparkleRegular } from '@fluentui/react-icons';
import {
  Dialog,
  DialogSurface,
  DialogActions,
  DialogBody,
  DialogContent,
  Button,
} from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { IntelligenceDocLayoutStatus200ResponseStatusEnum } from '@inkstain/client-api';
import { ToolbarButtonWithTooltip } from '~/web/components/Toolbar/Button';
import { useAppContext } from '~/web/app/hooks/useAppContext';

interface ToolbarChatButtonProps {
  showChat: boolean;
  onShowChatChange: (show: boolean) => void;
  docLayoutStatus: IntelligenceDocLayoutStatus200ResponseStatusEnum | undefined;
  startLayoutTask: () => void;
}

export const ToolbarChatButton = ({
  showChat,
  docLayoutStatus,
  onShowChatChange,
  startLayoutTask,
}: ToolbarChatButtonProps) => {
  const { t } = useTranslation();
  const { showAuthDialog, userInfo } = useAppContext();
  const [open, setOpen] = React.useState(false);
  const handleClick = () => {
    if (!showChat) {
      if (userInfo) {
        if (docLayoutStatus === 'completed') {
          onShowChatChange(true);
        } else {
          setOpen(true);
        }
      } else {
        showAuthDialog();
      }
    }
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(e, data) => {
        setOpen(data.open);
      }}
    >
      <ToolbarButtonWithTooltip
        content={t('chat_with_doc')}
        dataTest={'toolbar-chatBtn'}
        icon={<BotSparkleRegular />}
        onClick={handleClick}
      />
      <DialogSurface>
        <DialogBody>
          <DialogContent>{t('msg_require_doc_layout_for_chat')}</DialogContent>
          <DialogActions>
            <Button
              appearance="primary"
              onClick={() => {
                setOpen(false);
                startLayoutTask();
              }}
            >
              {t('confirm')}
            </Button>
            <Button
              onClick={() => {
                setOpen(false);
              }}
            >
              {t('cancel')}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
