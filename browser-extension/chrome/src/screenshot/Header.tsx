import {
  makeStyles,
  Popover,
  PopoverTrigger,
  Button,
  PopoverSurface,
} from '@fluentui/react-components';
import { SpacePopup } from './SpacePopup';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

const useClasses = makeStyles({
  root: {
    backgroundColor: 'white',
    height: '40px',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottom: '1px solid #e0e0e0',
    paddingLeft: '16px',
    '& > .fui-Button': {
      marginRight: '10px',
    },
  },
  popupSurface: {
    padding: '0',
    width: '400px',
    height: '500px',
  },
});

interface HeaderProps {
  onCrop: () => void;
  onSave: (spaceKey: string, documentPath: string) => void;
}

export const Header = ({ onCrop, onSave }: HeaderProps) => {
  const classes = useClasses();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Popover
      withArrow={true}
      open={isOpen}
      onOpenChange={(e, data) => setIsOpen(data.open)}
    >
      <div className={classes.root}>
        <Button onClick={onCrop}>{t('crop')}</Button>
        <PopoverTrigger>
          <Button>{t('save')}</Button>
        </PopoverTrigger>
      </div>
      <PopoverSurface>
        <div className={classes.popupSurface}>
          <SpacePopup
            onSave={(spaceKey, documentPath) => {
              onSave(spaceKey, documentPath);
              setIsOpen(false);
            }}
          />
        </div>
      </PopoverSurface>
    </Popover>
  );
};
