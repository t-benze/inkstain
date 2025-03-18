import * as React from 'react';
import {
  Toolbar,
  Input,
  Label,
  makeStyles,
  tokens,
  ToolbarDivider,
  shorthands,
} from '@fluentui/react-components';
import { ToolbarButtonWithTooltip } from '~/web/components/Toolbar/Button';
import {
  ChevronUpRegular,
  ChevronDownRegular,
  InsertFilled,
  InsertRegular,
} from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import { Toolbar as StylusToolbar } from '~/web/components/DrawingAnnotationOverlay';
import {
  ZoomToolbar,
  ToolbarProps as ZoomToolbarProps,
} from '~/web/components/ZoomToolbar';
import { DocLayoutAnalysisToolbar } from '~/web/components/DocLayoutAnalysisToolbar';
import { usePDFLayoutTask } from '~/web/components/PDFView/hooks';
import { ToolbarChatButton } from '~/web/components/DocumentChatView';
import { ToolbarTextViewButton } from '~/web/components/DocumentTextView';

interface PDFToolbarProps extends ZoomToolbarProps {
  numOfPages: number;
  currentPage: number;
  onPageChange: (pageNum: number) => void;
  enableScroll: boolean;
  onEnableScrollChange: (enableScroll: boolean) => void;
  onShowChatOverlayChange: () => void;
  onShowTextView: () => void;
}

const useClasses = makeStyles({
  root: {
    backgroundColor: tokens.colorNeutralBackground2,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    height: '32px',
    boxSizing: 'border-box',
  },
  pageNumInput: {
    width: '32px',
    marginRight: tokens.spacingHorizontalMNudge,
  },
  stylusPickerPanel: {},
  stylusPickerItem: {
    ...shorthands.padding(tokens.spacingHorizontalSNudge),
    fontSize: '16px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  colorPickerPanel: {},
  colorPickerItem: {
    display: 'inline-block',
    width: '20px',
    height: '20px',
    flexWrap: 'wrap',
    margin: tokens.spacingHorizontalSNudge,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    cursor: 'pointer',
  },
  strokeWidthPanel: {
    width: '80px',
  },
  strokeWidthPickerItem: {
    width: '100%',
    height: '20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
});

export const PDFToolbar = ({
  numOfPages,
  currentPage,
  onPageChange,
  enableScroll,
  onEnableScrollChange,
  onZoomFitHeight,
  onZoomFitWidth,
  onZoomIn,
  onZoomOut,
  onShowChatOverlayChange,
  onShowTextView,
}: PDFToolbarProps) => {
  const styles = useClasses();
  const { t } = useTranslation();
  const [currentPageInput, setCurrentPageInput] = React.useState<string>(
    currentPage.toString()
  );
  const handlePageNumChange = () => {
    const newPage = parseInt(currentPageInput, 10);
    if (newPage > 0 && newPage <= numOfPages) {
      onPageChange(newPage);
    } else {
      setCurrentPageInput(currentPage.toString());
    }
  };

  React.useEffect(() => {
    setCurrentPageInput(currentPage.toString());
  }, [currentPage]);
  const { taskStatus, startLayoutTask, docLayoutStatus } = usePDFLayoutTask();

  return (
    <Toolbar aria-label="pdf-toolbar" size="small" className={styles.root}>
      <ToolbarButtonWithTooltip
        content={t('pdfview.prevPageBtnTooltip')}
        dataTest="pdfViewer-prevPageBtn"
        icon={<ChevronUpRegular />}
        onClick={() => {
          setCurrentPageInput((currentPage - 1).toString());
          onPageChange(currentPage - 1);
        }}
      />

      <ToolbarButtonWithTooltip
        content={t('pdfview.nextPageBtnTooltip')}
        dataTest="pdfViewer-nextPageBtn"
        icon={<ChevronDownRegular />}
        onClick={() => {
          setCurrentPageInput((currentPage + 1).toString());
          onPageChange(currentPage + 1);
        }}
        disabled={currentPage === numOfPages}
      />
      <Input
        size="small"
        data-test="pdfViewer-pageNumInput"
        className={styles.pageNumInput}
        type="text"
        value={currentPageInput}
        onChange={(e) => {
          setCurrentPageInput(e.target.value);
        }}
        onKeyUp={(e) => {
          if (e.key === 'Enter') {
            handlePageNumChange();
            (e.target as HTMLInputElement).blur();
          }
        }}
        onBlur={handlePageNumChange}
      />
      <Label>{numOfPages}</Label>
      <ToolbarDivider />
      <ZoomToolbar
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onZoomFitWidth={onZoomFitWidth}
        onZoomFitHeight={onZoomFitHeight}
      />
      <ToolbarDivider />
      <ToolbarButtonWithTooltip
        content={t('pdfview.enableScrollBtnTooltip')}
        dataTest="pdfViewer-enableScrollBtn"
        onClick={() => {
          onEnableScrollChange(!enableScroll);
        }}
        icon={
          enableScroll ? (
            <InsertFilled primaryFill={tokens.colorBrandForeground1} />
          ) : (
            <InsertRegular />
          )
        }
      />
      <ToolbarDivider />
      <StylusToolbar />
      <ToolbarDivider />
      <DocLayoutAnalysisToolbar
        taskStatus={taskStatus}
        startLayoutTask={startLayoutTask}
        docLayoutStatus={docLayoutStatus}
      />
      <ToolbarChatButton
        docLayoutStatus={docLayoutStatus?.status}
        onOpenChatOverlay={onShowChatOverlayChange}
      />
      <ToolbarTextViewButton
        docLayoutStatus={docLayoutStatus?.status}
        onShowTextView={onShowTextView}
      />
    </Toolbar>
  );
};
