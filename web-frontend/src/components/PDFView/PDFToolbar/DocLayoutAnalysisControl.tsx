import {
  TextEffectsSparkleRegular,
  CheckmarkCircleFilled,
} from '@fluentui/react-icons';
import { tokens } from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@fluentui/react-components';
import { ToolbarButtonWithTooltip } from '~/web/components/Toolbar/Button';
import { usePDFLayoutTask } from '~/web/components/PDFView/hooks';
import { useUser } from '~/web/hooks/auth';
import { useAppContext } from '~/web/hooks/useAppContext';

export const DocLayoutAnalysisControl = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useUser();
  const { showAuthDialog } = useAppContext();

  const { taskStatus, startLayoutTask, docLayoutStatus } = usePDFLayoutTask();
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
