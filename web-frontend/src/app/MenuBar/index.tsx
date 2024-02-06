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
import { AppContext } from '~/web/app/context';

const useStyles = makeStyles({
  root: {
    backgroundColor: tokens.colorNeutralBackground3,
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
          <Button appearance="subtle" size="small">
            File
          </Button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem onClick={openSpaceManagementPage}>Spaces</MenuItem>
            <MenuItem onClick={toggleSettingsDialog}>Settings</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
    </div>
  );
};
