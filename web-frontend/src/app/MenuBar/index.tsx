import * as React from 'react';
import {
  Menu,
  MenuTrigger,
  MenuList,
  MenuItem,
  MenuPopover,
  Button,
  makeStyles,
  tokens,
  shorthands,
} from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { AppContext } from '~/web/app/context';

const useStyles = makeStyles({
  root: {
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
  const styles = useStyles();
  const { t } = useTranslation();
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const { openDocument } = React.useContext(AppContext);

  const toggleSettingsDialog = (): void => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const openSpaceManagementPage = () => {
    openDocument('@inkstain/space-management');
  };

  // Menu items will be updated to include opening the SpaceManagementDialog
  return (
    <div className={styles.root}>
      <Menu>
        <MenuTrigger>
          <Button data-test="menubar-file" appearance="subtle" size="small">
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
            <MenuItem
              data-test="menuItem-settings"
              onClick={toggleSettingsDialog}
            >
              {t('settings')}
            </MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
    </div>
  );
};
