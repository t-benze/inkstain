import * as React from 'react';
import { Button, Tooltip, tokens } from '@fluentui/react-components';
import {
  LayoutColumnThreeFocusLeftFilled,
  LayoutColumnThreeFocusRightFilled,
} from '@fluentui/react-icons';
import { useAppContext } from '~/web/app/hooks/useAppContext';
import { useTranslation } from 'react-i18next';

export const LayoutButtons = () => {
  const { settings, updateSettings } = useAppContext();
  const { t } = useTranslation();

  return (
    <>
      <Tooltip content={t('toggle_primary_sidebar')} relationship="description">
        <Button
          onClick={() => {
            updateSettings({
              layout: {
                primarySidebar: !settings.layout.primarySidebar,
                secondarySidebar: settings.layout.secondarySidebar,
              },
            });
          }}
          icon={
            <LayoutColumnThreeFocusLeftFilled
              primaryFill={
                settings.layout.primarySidebar
                  ? tokens.colorBrandBackground
                  : undefined
              }
            />
          }
          appearance="subtle"
        />
      </Tooltip>
      <Tooltip
        content={t('toggle_secondary_sidebar')}
        relationship="description"
      >
        <Button
          onClick={() => {
            updateSettings({
              layout: {
                primarySidebar: settings.layout.primarySidebar,
                secondarySidebar: !settings.layout.secondarySidebar,
              },
            });
          }}
          icon={
            <LayoutColumnThreeFocusRightFilled
              primaryFill={
                settings.layout.secondarySidebar
                  ? tokens.colorBrandBackground
                  : undefined
              }
            />
          }
          appearance="subtle"
        />
      </Tooltip>
    </>
  );
};
