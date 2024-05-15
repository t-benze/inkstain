import * as React from 'react';
import {
  Tooltip,
  ToolbarButton,
  Toolbar,
  Input,
  Label,
  makeStyles,
  tokens,
  ToolbarDivider,
  shorthands,
} from '@fluentui/react-components';
import {
  ChevronUpRegular,
  ChevronDownRegular,
  AutoFitHeightRegular,
  AutoFitWidthRegular,
  ZoomInRegular,
  ZoomOutRegular,
  ArrowResetRegular,
  InsertFilled,
  InsertRegular,
  GlassesRegular,
  GlassesFilled,
} from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';

interface PDFToolbarProps {
  numOfPages: number;
  currentPage: number;
  scale: number;
  onPageChange: (pageNum: number) => void;
  onScaleChange: (scale: number) => void;
  sceneWidth: number;
  sceneHeight: number;
  initViewportWidth: number;
  initViewportHeight: number;
  initScale: number;
  scaleSteps: number[];
  enableScroll: boolean;
  onEnableScrollChange: (enableScroll: boolean) => void;
  showLayoutAnalysis: boolean;
  onShowLayoutAnalysisChange: (showLayoutAnalysis: boolean) => void;
}

const useStyles = makeStyles({
  root: {
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke1),
  },
  pageNumInput: {
    width: '32px',
    marginRight: tokens.spacingHorizontalMNudge,
  },
});

export const PDFToolbar = ({
  numOfPages,
  currentPage,
  onPageChange,
  scale,
  onScaleChange,
  sceneHeight,
  sceneWidth,
  initViewportHeight,
  initViewportWidth,
  initScale,
  scaleSteps,
  enableScroll,
  onEnableScrollChange,
  showLayoutAnalysis,
  onShowLayoutAnalysisChange,
}: PDFToolbarProps) => {
  const styles = useStyles();
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

  return (
    <Toolbar aria-label="pdf-toolbar" size="small" className={styles.root}>
      <Tooltip
        content={t('pdfview.prevPageBtnTooltip')}
        relationship="description"
        positioning={'below'}
      >
        <ToolbarButton
          data-test="pdfViewer-prevPageBtn"
          disabled={currentPage === 1}
          icon={<ChevronUpRegular />}
          onClick={() => {
            setCurrentPageInput((currentPage - 1).toString());
            onPageChange(currentPage - 1);
          }}
        />
      </Tooltip>
      <Tooltip
        content={t('pdfview.nextPageBtnTooltip')}
        relationship="description"
        positioning={'below'}
      >
        <ToolbarButton
          data-test="pdfViewer-nextPageBtn"
          disabled={currentPage === numOfPages}
          icon={<ChevronDownRegular />}
          onClick={() => {
            setCurrentPageInput((currentPage + 1).toString());
            onPageChange(currentPage + 1);
          }}
        />
      </Tooltip>
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
          }
        }}
        onBlur={handlePageNumChange}
      />
      <Label>{numOfPages}</Label>
      <ToolbarDivider />
      <Tooltip
        content={t('pdfview.zoomInBtnTooltip')}
        relationship="description"
        positioning={'below'}
      >
        <ToolbarButton
          data-test="pdfViewer-zoomInBtn"
          icon={<ZoomInRegular />}
          onClick={() => {
            const nextScale = scaleSteps.find((s) => s > scale);
            if (nextScale) {
              onScaleChange(nextScale);
            }
          }}
        />
      </Tooltip>
      <Tooltip
        content={t('pdfview.zoomOutBtnTooltip')}
        relationship="description"
        positioning={'below'}
      >
        <ToolbarButton
          data-test="pdfViewer-zoomOutBtn"
          icon={<ZoomOutRegular />}
          onClick={() => {
            const nextScale = [...scaleSteps].reverse().find((s) => s < scale);
            if (nextScale) {
              onScaleChange(nextScale);
            }
          }}
        />
      </Tooltip>
      {initViewportWidth ? (
        <Tooltip
          content={t('pdfview.fitWidthBtnTooltip')}
          relationship="description"
          positioning={'below'}
        >
          <ToolbarButton
            data-test="pdfViewer-fitWidthBtn"
            icon={<AutoFitWidthRegular />}
            onClick={() => {
              onScaleChange(initScale * (sceneWidth / initViewportWidth));
            }}
          />
        </Tooltip>
      ) : null}
      {initViewportHeight ? (
        <Tooltip
          content={t('pdfview.fitHeightBtnTooltip')}
          relationship="description"
          positioning={'below'}
        >
          <ToolbarButton
            data-test="pdfViewer-fitHeightBtn"
            icon={<AutoFitHeightRegular />}
            onClick={() => {
              onScaleChange(initScale * (sceneHeight / initViewportHeight));
            }}
          />
        </Tooltip>
      ) : null}
      <Tooltip
        content={t('pdfview.resetScaleBtnTooltip')}
        relationship="description"
        positioning={'below'}
      >
        <ToolbarButton
          data-test="pdfViewer-resetScaleBtn"
          icon={<ArrowResetRegular />}
          onClick={() => {
            onScaleChange(initScale);
          }}
        />
      </Tooltip>
      <Tooltip
        relationship="description"
        content={t('pdfview.enableScrollBtnTooltip')}
        positioning={'below'}
      >
        <ToolbarButton
          data-test="pdfViewer-enableScrollBtn"
          onClick={() => {
            onEnableScrollChange(!enableScroll);
          }}
          icon={
            enableScroll ? (
              <InsertFilled color={tokens.colorBrandForeground1} />
            ) : (
              <InsertRegular />
            )
          }
        />
      </Tooltip>
      <Tooltip
        relationship="description"
        content={t('pdfview.analyzeDocBtnTooltip')}
        positioning={'below'}
      >
        <ToolbarButton
          data-test="pdfViewer-analyzeDocBtn"
          icon={
            showLayoutAnalysis ? (
              <GlassesFilled color={tokens.colorBrandForeground1} />
            ) : (
              <GlassesRegular />
            )
          }
          onClick={() => {
            onShowLayoutAnalysisChange(!showLayoutAnalysis);
          }}
        />
      </Tooltip>
    </Toolbar>
  );
};
