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
  Dropdown,
  Option,
  Popover,
  PopoverSurface,
  PopoverTrigger,
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
  CursorRegular,
  RectangleLandscapeRegular,
  LineRegular,
  CircleRegular,
} from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import { StylusOption } from './types';

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
  stylus: StylusOption;
  onStylusChange: (value: StylusOption) => void;
  strokeColor: string;
  onStrokeColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
}

const useClasses = makeStyles({
  root: {
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke1),
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

const MyButton = ({
  content,
  icon,
  dataTest,
  onClick,
  disabled,
}: {
  content: string;
  dataTest: string;
  icon: JSX.Element;
  onClick: () => void;
  disabled?: boolean;
}) => {
  return (
    <Tooltip content={content} relationship="description" positioning={'below'}>
      <ToolbarButton
        disabled={disabled}
        data-test={dataTest}
        icon={icon}
        onClick={onClick}
      />
    </Tooltip>
  );
};

const StylusPickerPopover = ({
  stylus,
  onStylusChange,
}: {
  stylus: StylusOption;
  onStylusChange: (stylus: StylusOption) => void;
}) => {
  const { t } = useTranslation();
  const classes = useClasses();
  const [open, setOpen] = React.useState(false);
  const options = ['select', 'line', 'rect', 'ellipse'] as Array<StylusOption>;
  const optionToIcon = {
    select: <CursorRegular />,
    line: <LineRegular />,
    rect: <RectangleLandscapeRegular />,
    ellipse: <CircleRegular />,
  };
  return (
    <Popover
      positioning={'below'}
      withArrow={true}
      open={open}
      onOpenChange={(_, data) => {
        setOpen(data.open);
      }}
    >
      <Tooltip
        content={t(`pdfview.stylus_${stylus}`)}
        relationship="description"
        positioning="below"
      >
        <PopoverTrigger>
          <ToolbarButton
            data-test="pdfViewer-pickStylusBtn"
            icon={optionToIcon[stylus]}
          />
        </PopoverTrigger>
      </Tooltip>
      <PopoverSurface>
        <div className={classes.stylusPickerPanel}>
          {options.map((option) => (
            <Tooltip
              relationship="description"
              positioning={'after'}
              content={t(`pdfview.stylus_${option}`)}
            >
              <div
                data-test={`pdfViewer-stylus-${option}`}
                className={classes.stylusPickerItem}
                onClick={() => {
                  onStylusChange(option);
                  setOpen(false);
                }}
              >
                {optionToIcon[option]}
              </div>
            </Tooltip>
          ))}
        </div>
      </PopoverSurface>
    </Popover>
  );
};

const StrokeColorPickerPopover = ({
  onColorChange,
  color,
}: {
  onColorChange: (color: string) => void;
  color: string;
}) => {
  const { t } = useTranslation();
  const classes = useClasses();
  const [open, setOpen] = React.useState(false);
  const colors = [
    '#000000', // black
    '#808080', // gray
    '#c0c0c0', // silver
    '#ffffff', // white
    '#800000', // maroon
    '#ff0000', // red
    '#808000', // olive
    '#ffff00', // yellow
    '#008000', // green
    '#00ff00', // lime
    '#008080', // teal
    '#00ffff', // aqua
    '#000080', // navy
    '#0000ff', // blue
    '#800080', // purple
    '#ff00ff', // fuchsia
  ];
  const colorRow = [
    colors.slice(0, 5),
    colors.slice(5, 10),
    colors.slice(10, 15),
  ];
  return (
    <Popover
      positioning={'below'}
      withArrow={true}
      open={open}
      onOpenChange={(_, data) => {
        setOpen(data.open);
      }}
    >
      <Tooltip
        content={t('pdfview.pickColorTooltip')}
        relationship="description"
        positioning="below"
      >
        <PopoverTrigger>
          <ToolbarButton
            icon={
              <div
                style={{
                  backgroundColor: color,
                  width: '10px',
                  height: '10px',
                  borderRadius: '5px',
                }}
              />
            }
          />
        </PopoverTrigger>
      </Tooltip>
      <PopoverSurface>
        <div className={classes.colorPickerPanel}>
          {colorRow.map((row) => (
            <div>
              {row.map((c) => (
                <div
                  className={classes.colorPickerItem}
                  style={{ backgroundColor: c }}
                  onClick={() => {
                    onColorChange(c);
                    setOpen(false);
                  }}
                ></div>
              ))}
            </div>
          ))}
        </div>
      </PopoverSurface>
    </Popover>
  );
};

const StrokeWidthPickerPopover = ({
  strokeWidth,
  onStrokeWidthChange,
}: {
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
}) => {
  const { t } = useTranslation();
  const classes = useClasses();
  const [open, setOpen] = React.useState(false);
  return (
    <Popover
      positioning={'below'}
      withArrow={true}
      open={open}
      onOpenChange={(_, data) => {
        setOpen(data.open);
      }}
    >
      <Tooltip
        content={t('pdfview.pickThicknessTooltip')}
        relationship="description"
        positioning={'below'}
      >
        <PopoverTrigger>
          <ToolbarButton
            icon={
              <div
                style={{
                  width: '10px',
                  height: `${strokeWidth}px`,
                  backgroundColor: `#000000`,
                }}
              />
            }
          />
        </PopoverTrigger>
      </Tooltip>
      <PopoverSurface>
        <div className={classes.strokeWidthPanel}>
          {[1, 2, 3, 4, 5].map((width) => (
            <Tooltip
              relationship="description"
              content={`${width}px`}
              positioning={'after'}
            >
              <div
                className={classes.strokeWidthPickerItem}
                onClick={() => {
                  onStrokeWidthChange(width);
                  setOpen(false);
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: `${width}px`,
                    backgroundColor: `#000000`,
                  }}
                ></div>
              </div>
            </Tooltip>
          ))}
        </div>
      </PopoverSurface>
    </Popover>
  );
};

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
  stylus,
  onStylusChange,
  strokeColor,
  onStrokeColorChange,
  strokeWidth,
  onStrokeWidthChange,
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

  return (
    <Toolbar aria-label="pdf-toolbar" size="small" className={styles.root}>
      <MyButton
        content={t('pdfview.prevPageBtnTooltip')}
        dataTest="pdfViewer-prevPageBtn"
        icon={<ChevronUpRegular />}
        onClick={() => {
          setCurrentPageInput((currentPage - 1).toString());
          onPageChange(currentPage - 1);
        }}
      />

      <MyButton
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
          }
        }}
        onBlur={handlePageNumChange}
      />
      <Label>{numOfPages}</Label>
      <ToolbarDivider />
      <MyButton
        content={t('pdfview.zoomInBtnTooltip')}
        dataTest="pdfViewer-zoomInBtn"
        icon={<ZoomInRegular />}
        onClick={() => {
          const nextScale = scaleSteps.find((s) => s > scale);
          if (nextScale) {
            onScaleChange(nextScale);
          }
        }}
      />
      <MyButton
        content={t('pdfview.zoomOutBtnTooltip')}
        dataTest="pdfViewer-zoomOutBtn"
        icon={<ZoomOutRegular />}
        onClick={() => {
          const nextScale = [...scaleSteps].reverse().find((s) => s < scale);
          if (nextScale) {
            onScaleChange(nextScale);
          }
        }}
      />
      {initViewportWidth ? (
        <MyButton
          content={t('pdfview.fitWidthBtnTooltip')}
          dataTest="pdfViewer-fitWidthBtn"
          icon={<AutoFitWidthRegular />}
          onClick={() => {
            onScaleChange(initScale * (sceneWidth / initViewportWidth));
          }}
        />
      ) : null}
      {initViewportHeight ? (
        <MyButton
          content={t('pdfview.fitHeightBtnTooltip')}
          dataTest="pdfViewer-fitHeightBtn"
          icon={<AutoFitHeightRegular />}
          onClick={() => {
            onScaleChange(initScale * (sceneHeight / initViewportHeight));
          }}
        />
      ) : null}
      <MyButton
        content={t('pdfview.resetScaleBtnTooltip')}
        dataTest="pdfViewer-resetScaleBtn"
        icon={<ArrowResetRegular />}
        onClick={() => {
          onScaleChange(initScale);
        }}
      />
      <MyButton
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
      <StylusPickerPopover stylus={stylus} onStylusChange={onStylusChange} />
      <StrokeColorPickerPopover
        color={strokeColor}
        onColorChange={onStrokeColorChange}
      />
      <StrokeWidthPickerPopover
        strokeWidth={strokeWidth}
        onStrokeWidthChange={onStrokeWidthChange}
      />
      <ToolbarDivider />
      <MyButton
        content={t('pdfview.analyzeDocBtnTooltip')}
        dataTest="pdfViewer-analyzeDocBtn"
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
    </Toolbar>
  );
};
