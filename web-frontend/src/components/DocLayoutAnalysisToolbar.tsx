import {
  TextEffectsSparkleRegular,
  CheckmarkCircleFilled,
} from '@fluentui/react-icons';
import { tokens } from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@fluentui/react-components';
import { ToolbarButtonWithTooltip } from '~/web/components/Toolbar/Button';
import { useAppContext } from '~/web/app/hooks/useAppContext';
import {
  IntelligenceDocLayoutStatus200Response,
  Task,
} from '@inkstain/client-api';

interface DocLayoutAnalysisToolbarProps {
  taskStatus: Task | null | undefined;
  startLayoutTask: () => void;
  docLayoutStatus: IntelligenceDocLayoutStatus200Response | undefined;
}

export const DocLayoutAnalysisToolbar = ({
  taskStatus,
  startLayoutTask,
  docLayoutStatus,
}: DocLayoutAnalysisToolbarProps) => {
  const { t } = useTranslation();
  const { showAuthDialog, userInfo, settings } = useAppContext();
  const hasRunningTask = taskStatus
    ? taskStatus.status !== 'completed' && taskStatus.status !== 'failed'
    : false;

  return (
    <>
      <ToolbarButtonWithTooltip
        content={t('pdfview.analyzeDocBtnTooltip')}
        dataTest="toolbar-analyzeDocBtn"
        icon={<TextEffectsSparkleRegular />}
        disabled={hasRunningTask}
        onClick={() => {
          if (settings.ocrService === 'remote') {
            if (userInfo) {
              startLayoutTask();
            } else {
              showAuthDialog();
            }
          } else {
            startLayoutTask();
          }
        }}
      />
      {docLayoutStatus && docLayoutStatus.status === 'completed' && (
        <CheckmarkCircleFilled
          data-test="toolbar-docLayoutReady"
          primaryFill={tokens.colorBrandBackground}
        />
      )}
      {hasRunningTask && (
        <Spinner data-test="toolbar-docLayoutAnalysisSpinner" size="tiny" />
      )}
    </>
  );
};
