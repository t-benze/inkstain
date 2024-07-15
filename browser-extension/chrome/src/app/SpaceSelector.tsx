import * as React from 'react';
import {
  makeStyles,
  Dropdown,
  Label,
  Option,
} from '@fluentui/react-components';
import { useQuery } from '@tanstack/react-query';
import { spacesApi } from '~/chrome-extension/apiClient';
import { useTranslation } from 'react-i18next';

const useClasses = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'row',
    gap: '10px',
    alignItems: 'center',
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
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>([]);
  const [value, setValue] = React.useState('');

  const { data } = useQuery({
    queryKey: ['spaces'],
    queryFn: async () => {
      const response = await spacesApi.getSpaces();
      return response;
    },
  });

  React.useEffect(() => {
    if (spaceKey && data?.length) {
      const selectedKey = data.find((space) => space.key === spaceKey);
      if (selectedKey) {
        setSelectedOptions([selectedKey.key]);
        setValue(selectedKey.name);
      }
    }
  }, [spaceKey, data]);

  return data ? (
    data.length > 0 ? (
      <div className={classes.root}>
        <Label>{t('space')}</Label>
        <Dropdown
          onOptionSelect={(_, data) => {
            setSelectedOptions(data.selectedOptions);
            setValue(data.optionText ?? '');
            onSpaceKeyChange(data.optionValue ?? '');
            chrome &&
              chrome.runtime &&
              chrome.runtime.sendMessage({
                action: 'setSpaceKey',
                spaceKey: data.optionValue,
              });
          }}
          selectedOptions={selectedOptions}
          value={value}
        >
          {data.map((space) => (
            <Option key={space.key} value={space.key} text={space.name}>
              {space.name}
            </Option>
          ))}
        </Dropdown>
      </div>
    ) : (
      <div>{t('no_spaces')}</div>
    )
  ) : (
    <div>{t('loading')}</div>
  );
};
