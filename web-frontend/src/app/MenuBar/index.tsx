import * as React from 'react';
import {
  Menu,
  MenuTrigger,
  MenuList,
  MenuItem,
  MenuProps,
  MenuPopover,
  MenuItemCheckbox,
  Button,
  shorthands,
  tokens,
  makeStyles,
} from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { AppContext } from '~/web/app/context';
import { ViewMenu } from './ViewMenu';

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

const FileMenu = () => {
  const { t } = useTranslation();
  const { openDocument } = React.useContext(AppContext);

  const openSpaceManagementPage = () => {
    openDocument('@inkstain/space-management');
  };

  return (
    <Menu>
      <MenuTrigger>
        <Button data-test="menubar-fileBtn" appearance="subtle" size="small">
          {t('file')}
        </Button>
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          <MenuItem
            data-test="menuItem-space"
            onClick={openSpaceManagementPage}
          >
            {t('space._')}
          </MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  );
};

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
