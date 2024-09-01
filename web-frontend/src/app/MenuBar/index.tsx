import * as React from 'react';
import { shorthands, tokens, makeStyles } from '@fluentui/react-components';
import { ViewMenu } from './ViewMenu';
import { FileMenu } from './FileMenu';

const useClasses = makeStyles({
  root: {
    height: `30px`,
    boxSizing: 'border-box',
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderBottom(
      tokens.strokeWidthThin,
      'solid',
      tokens.colorNeutralStroke1
    ),
    ...shorthands.padding(
      tokens.spacingVerticalXXS,
      tokens.spacingHorizontalNone
    ),
  },
});

export const MenuBar = () => {
  const classes = useClasses();

  // Menu items will be updated to include opening the SpaceManagementDialog
  return (
    <div className={classes.root}>
      <FileMenu />
      <ViewMenu />
    </div>
  );
};
