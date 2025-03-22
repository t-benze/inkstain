import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItemCheckbox,
  Button,
  MenuProps,
} from '@fluentui/react-components';
import { useAppContext } from '../hooks/useAppContext';
import { Settings } from '@inkstain/client-api';

export const ViewMenu = () => {
  const { t } = useTranslation();
  const { settings, updateSettings } = useAppContext();
  // const { appearance, setAppearance } = React.useContext(AppContext);

  const checkedValues = {
    view: [
      settings.layout.primarySidebar ? 'primarySidebar' : null,
      settings.layout.secondarySidebar ? 'secondarySidebar' : null,
    ].filter(Boolean) as string[],
  };

  const onChange: MenuProps['onCheckedValueChange'] = (_, { checkedItems }) => {
    const layout = {
      primarySidebar: false,
      secondarySidebar: false,
    };
    checkedItems.forEach((item) => {
      layout[item as keyof Settings['layout']] = true;
    });

    updateSettings({
      layout,
    });
  };

  return (
    <Menu checkedValues={checkedValues} onCheckedValueChange={onChange}>
      <MenuTrigger>
        <Button data-test="menubar-viewBtn" appearance="subtle" size="small">
          {t('view')}
        </Button>
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          <MenuItemCheckbox
            name="view"
            value="primarySidebar"
            data-test="menubar-togglePrimarySidebar"
          >
            {t('view_primary_sidebar')}
          </MenuItemCheckbox>
          <MenuItemCheckbox
            name="view"
            value="secondarySidebar"
            data-test="menubar-toggleSecondarySidebar"
          >
            {t('view_secondary_sidebar')}
          </MenuItemCheckbox>
        </MenuList>
      </MenuPopover>
    </Menu>
  );
};
