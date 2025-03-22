import * as React from 'react';
import { shorthands, tokens, makeStyles } from '@fluentui/react-components';
import { ViewMenu } from './ViewMenu';
import { FileMenu } from './FileMenu';
import { LayoutButtons } from './LayoutButtons';

const useClasses = makeStyles({
  root: {
    height: `30px`,
    boxSizing: 'border-box',
    backgroundColor: tokens.colorNeutralBackground2,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    paddingRight: `${tokens.spacingHorizontalS}`,
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
  },
  spacer: {
    flexGrow: 1,
  },
});

export const MenuBar = () => {
  const classes = useClasses();

  // Menu items will be updated to include opening the SpaceManagementDialog
  return (
    <div className={classes.root}>
      <FileMenu />
      <ViewMenu />
      <div className={classes.spacer} />
      <LayoutButtons />
    </div>
  );
};
