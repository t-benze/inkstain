import * as React from 'react';
import { StylusOption } from './types';
import { useTranslation } from 'react-i18next';
import {
  shorthands,
  makeStyles,
  tokens,
  Tooltip,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  ToolbarButton,
} from '@fluentui/react-components';
import {
  CursorRegular,
  RectangleLandscapeRegular,
  LineRegular,
  CircleRegular,
  PenRegular,
  HighlightRegular,
} from '@fluentui/react-icons';
import { DrawingAnnotationOverlayContext } from './context';

const useClasses = makeStyles({
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
  const options = [
    'select',
    'highlight',
    'line',
    'rect',
    'ellipse',
    'pen',
  ] as Array<StylusOption>;
  const optionToIcon = {
    select: <CursorRegular />,
    highlight: <HighlightRegular />,
    line: <LineRegular />,
    rect: <RectangleLandscapeRegular />,
    ellipse: <CircleRegular />,
    pen: <PenRegular />,
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
        content={t(`stylus_${stylus}`)}
        relationship="description"
        positioning="below"
      >
        <PopoverTrigger>
          <ToolbarButton
            data-test="toolbar-pickStylusBtn"
            icon={optionToIcon[stylus]}
          />
        </PopoverTrigger>
      </Tooltip>
      <PopoverSurface>
        <div className={classes.stylusPickerPanel}>
          {options.map((option) => (
            <Tooltip
              key={option}
              relationship="description"
              positioning={'after'}
              content={t(`stylus_${option}`)}
            >
              <div
                data-test={`toolbar-stylus-${option}`}
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
        content={t('pick_color_tooltip')}
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
            <div key={row.join('-')}>
              {row.map((c) => (
                <div
                  key="c"
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
        content={t('change_thinkness_tooltip')}
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
              key={`stroke-width-${width}`}
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

export const Toolbar = () => {
  const {
    selectedStylus,
    handleStrokeColorChange,
    strokeColor,
    handleStrokeWidthChange,
    strokeWidth,
    handleStylusChange,
  } = React.useContext(DrawingAnnotationOverlayContext);
  return (
    <>
      <StylusPickerPopover
        stylus={selectedStylus}
        onStylusChange={handleStylusChange}
      />
      <StrokeColorPickerPopover
        color={strokeColor}
        onColorChange={handleStrokeColorChange}
      />
      <StrokeWidthPickerPopover
        strokeWidth={strokeWidth}
        onStrokeWidthChange={handleStrokeWidthChange}
      />
    </>
  );
};
