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
import { AppContext } from '~/web/app/context';
import { Appearance, AppearanceKey } from '~/web/app/types';

export const ViewMenu = () => {
  const { t } = useTranslation();
  const { appearance, setAppearance } = React.useContext(AppContext);

  const checkedValues = {
    view: [
      appearance.showPrimarySidebar ? 'showPrimarySidebar' : null,
      appearance.showSecondarySidebar ? 'showSecondarySidebar' : null,
    ].filter(Boolean) as string[],
  };

  const onChange: MenuProps['onCheckedValueChange'] = (_, { checkedItems }) => {
    const appearance: Appearance = {
      showPrimarySidebar: false,
      showSecondarySidebar: false,
    };
    checkedItems.forEach((item) => {
      appearance[item as AppearanceKey] = true;
    });
    setAppearance(appearance);
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
            value="showPrimarySidebar"
            data-test="menubar-togglePrimarySidebar"
          >
            {t('view_primary_sidebar')}
          </MenuItemCheckbox>
          <MenuItemCheckbox
            name="view"
            value="showSecondarySidebar"
            data-test="menubar-toggleSecondarySidebar"
          >
            {t('view_secondary_sidebar')}
          </MenuItemCheckbox>
        </MenuList>
      </MenuPopover>
    </Menu>
  );
};
