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

const MenuBar = () => {
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  const toggleSettingsDialog = (): void => {
    setIsSettingsOpen(!isSettingsOpen);
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
          </MenuList>
        </MenuPopover>
      </Menu>
      {isSettingsOpen && (
        <SettingsDialog
          isOpen={isSettingsOpen}
          onDismiss={toggleSettingsDialog}
        />
      )}
    </div>
  );
};

export default MenuBar;
