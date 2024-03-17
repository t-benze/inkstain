import * as React from 'react';
import {
  Menu,
  MenuTrigger,
  MenuList,
  MenuItem,
  MenuPopover,
  Button,
} from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { AppContext } from '~/web/app/context';

export const MenuBar = () => {
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
  );
};
