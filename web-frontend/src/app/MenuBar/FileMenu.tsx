import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../context';
import {
  Menu,
  MenuTrigger,
  MenuList,
  MenuItem,
  MenuPopover,
  Button,
} from '@fluentui/react-components';

export const FileMenu = () => {
  const { t } = useTranslation();
  const { openDocument } = React.useContext(AppContext);

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
            onClick={() => {
              openDocument('@inkstain/space-management');
            }}
          >
            {t('space._')}
          </MenuItem>
          <MenuItem
            data-test="menuItem-settings"
            onClick={() => {
              openDocument('@inkstain/settings');
            }}
          >
            {t('settings')}
          </MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  );
};
