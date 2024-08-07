import * as React from 'react';
import {
  Toolbar,
  makeStyles,
  tokens,
  ToolbarDivider,
  shorthands,
} from '@fluentui/react-components';
import { Toolbar as StylusToolbar } from '~/web/components/DrawingAnnotationOverlay';
import {
  ZoomToolbar,
  ToolbarProps as ZoomToolbarProps,
} from '~/web/components/ZoomToolbar';

type ToolbarProps = ZoomToolbarProps;

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

export const WebclipToolbar = ({
  onZoomFitWidth,
  onZoomIn,
  onZoomOut,
  onZoomFitHeight,
}: ToolbarProps) => {
  const styles = useClasses();

  return (
    <Toolbar aria-label="webclip-toolbar" size="small" className={styles.root}>
      <ZoomToolbar
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onZoomFitWidth={onZoomFitWidth}
        onZoomFitHeight={onZoomFitHeight}
      />
      <ToolbarDivider />
      <StylusToolbar />
    </Toolbar>
  );
};
