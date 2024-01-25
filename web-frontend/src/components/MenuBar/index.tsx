import * as React from 'react';
import {
  Menu,
  MenuTrigger,
  MenuList,
  MenuItem,
  MenuPopover,
  Button,
} from '@fluentui/react-components';
import SettingsDialog from '~/web/components/SettingsDialog';
import SpaceManagementDialog from '~/web/components/SpaceManagementDialog';

const MenuBar = () => {
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [isSpaceManagementOpen, setIsSpaceManagementOpen] =
    React.useState(false);

  const toggleSettingsDialog = (): void => {
    setIsSettingsOpen(!isSettingsOpen);
  };
  const toggleSpaceManagementDialog = (): void => {
    setIsSpaceManagementOpen(!isSpaceManagementOpen);
  };

  // Menu items will be updated to include opening the SpaceManagementDialog
  return (
    <div>
      <Menu>
        <MenuTrigger>
          <Button>Menu</Button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem onClick={toggleSettingsDialog}>Settings</MenuItem>
            <MenuItem onClick={toggleSpaceManagementDialog}>
              Manage Spaces
            </MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
      {isSettingsOpen && (
        <SettingsDialog
          isOpen={isSettingsOpen}
          onDismiss={toggleSettingsDialog}
        />
      )}
      {isSpaceManagementOpen && (
        <SpaceManagementDialog
          isOpen={isSpaceManagementOpen}
          onDismiss={toggleSpaceManagementDialog}
        />
      )}
    </div>
  );
};

export default MenuBar;
