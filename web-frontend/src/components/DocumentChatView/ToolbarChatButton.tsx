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

interface ToolbarChatButtonProps {
  onShowChatChange: (show: boolean) => void;
  docLayoutStatus: IntelligenceDocLayoutStatus200ResponseStatusEnum | undefined;
}

export const ToolbarChatButton = ({
  docLayoutStatus,
  onShowChatChange,
}: ToolbarChatButtonProps) => {
  const { t } = useTranslation();
  const [openDialog, setOpenDialog] = React.useState(false);
  const handleClick = () => {
    if (docLayoutStatus === 'completed') {
      onShowChatChange(true);
    } else {
      setOpenDialog(true);
    }
  };
  return (
    <Dialog
      open={openDialog}
      onOpenChange={(e, data) => {
        setOpenDialog(data.open);
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
                setOpenDialog(false);
              }}
            >
              {t('confirm')}
            </Button>
            <Button
              onClick={() => {
                setOpenDialog(false);
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
