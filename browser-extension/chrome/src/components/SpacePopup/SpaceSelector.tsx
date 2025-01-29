import * as React from 'react';
import {
  makeStyles,
  Dropdown,
  Label,
  Option,
  Select,
} from '@fluentui/react-components';
import { useQuery } from '@tanstack/react-query';
import { spacesApi } from '~/chrome-extension/utils/apiClient';
import { useTranslation } from 'react-i18next';

const useClasses = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'row',
    gap: '10px',
    alignItems: 'center',
    '& > .fui-Select': {
      width: '200px',
    },
  },
});

interface SpaceSelectorProps {
  spaceKey: string;
  onSpaceKeyChange: (spaceKey: string) => void;
}
export const SpaceSelector = ({
  spaceKey,
  onSpaceKeyChange,
}: SpaceSelectorProps) => {
  const classes = useClasses();
  const { t } = useTranslation();

  const { data } = useQuery({
    queryKey: ['spaces'],
    queryFn: async () => {
      const response = await spacesApi.getSpaces();
      if (!spaceKey && response.length) {
        onSpaceKeyChange(response[0].key);
      }
      return response;
    },
  });

  return data ? (
    data.length > 0 ? (
      <div className={classes.root}>
        <Label>{t('space')}</Label>
        <Select
          onChange={(_, selectData) => {
            onSpaceKeyChange(selectData.value);
            chrome &&
              chrome.runtime &&
              chrome.runtime.sendMessage({
                action: 'setSpaceKey',
                spaceKey: selectData.value,
              });
          }}
          value={spaceKey || ''}
        >
          {data.map((space) => (
            <option key={space.key} value={space.key}>
              {space.name}
            </option>
          ))}
        </Select>
      </div>
    ) : (
      <div>{t('no_spaces')}</div>
    )
  ) : (
    <div>{t('loading')}</div>
  );
};
