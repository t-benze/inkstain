import {
  TextEffectsSparkleRegular,
  CheckmarkCircleFilled,
} from '@fluentui/react-icons';
import { tokens } from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@fluentui/react-components';
import { ToolbarButtonWithTooltip } from '~/web/components/Toolbar/Button';
import { useUser } from '~/web/hooks/auth';
import { useAppContext } from '~/web/hooks/useAppContext';
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
  const { isAuthenticated } = useUser();
  const { showAuthDialog } = useAppContext();
  const hasRunningTask = taskStatus
    ? taskStatus.status !== 'completed' && taskStatus.status !== 'failed'
    : false;

  return (
    <>
      <ToolbarButtonWithTooltip
        content={t('pdfview.analyzeDocBtnTooltip')}
        dataTest="pdfViewer-analyzeDocBtn"
        icon={<TextEffectsSparkleRegular />}
        disabled={hasRunningTask}
        onClick={() => {
          if (isAuthenticated) {
            startLayoutTask();
          } else {
            showAuthDialog();
          }
        }}
      />
      {docLayoutStatus && docLayoutStatus.status === 'completed' && (
        <CheckmarkCircleFilled primaryFill={tokens.colorBrandBackground} />
      )}
      {hasRunningTask && <Spinner size="tiny" />}
    </>
  );
};
