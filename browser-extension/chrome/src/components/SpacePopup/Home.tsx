import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles, tokens } from '@fluentui/react-components';
import { useQuery } from '@tanstack/react-query';
import { Spinner, Body1, Button, Input } from '@fluentui/react-components';
import { systemApi } from '~/chrome-extension/utils/apiClient';
import { PlatformInfo200Response } from '@inkstain/client-api';
import { PopupContext } from './context';
import { SpaceSelector } from './SpaceSelector';
import { FolderExplorer } from './FolderExplorer';
import { SettingsRegular } from '@fluentui/react-icons';

const useClasses = makeStyles({
  root: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  content: {
    width: '100%',
    height: '0px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  error: {
    padding: tokens.spacingHorizontalM,
    display: 'flex',
    flexDirection: 'column',
    '& > .fui-Body1': {
      display: 'block',
      marginBottom: tokens.spacingVerticalM,
    },
  },
  buttons: {
    height: '40px',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    gap: tokens.spacingHorizontalXS,
    '& > .fui-Input': {
      flex: 1,
    },
  },
});

const Main = ({
  platformInfo,
  onSettingsClick,
  onSave,
}: {
  platformInfo: PlatformInfo200Response;
  onSettingsClick: () => void;
  onSave: (spaceKey: string, documentPath: string) => void;
}) => {
  const [spaceKey, setSpaceKey] = React.useState<string>('');
  const [currentFolder, setCurrentFolder] = React.useState<Array<string>>(['']);
  const popupContext = React.useContext(PopupContext);
  const [name, setName] = React.useState<string>(popupContext.data.title || '');

  const classes = useClasses();
  const { t } = useTranslation();
  const handleFolderSelected = React.useCallback((folder: string[]) => {
    setCurrentFolder(folder);
  }, []);

  React.useEffect(() => {
    chrome.runtime &&
      chrome.runtime.sendMessage(
        { action: 'getSpaceKey' },
        undefined,
        (result: string) => {
          if (result) {
            setSpaceKey(result);
          }
        }
      );
  });

  return (
    <>
      <div className={classes.header}>
        <SpaceSelector spaceKey={spaceKey} onSpaceKeyChange={setSpaceKey} />
        <Button onClick={onSettingsClick} icon={<SettingsRegular />}></Button>
      </div>
      {spaceKey ? (
        <div className={classes.content}>
          <FolderExplorer
            spaceKey={spaceKey}
            currentFolder={currentFolder}
            onFolderSelected={handleFolderSelected}
          />
          <div className={classes.buttons}>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
            <Button
              appearance="primary"
              onClick={() =>
                onSave(
                  spaceKey,
                  [...currentFolder.slice(1), name].join(platformInfo.pathSep)
                )
              }
            >
              {popupContext.behavior === 'download' ? t('download') : t('save')}
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
};

interface HomeProps {
  setShowSettings: (show: boolean) => void;
  onSave: (spaceKey: string, documentPath: string) => void;
}

export function Home({ setShowSettings, onSave }: HomeProps) {
  const classes = useClasses();
  const { platformInfo } = React.useContext(PopupContext);
  return (
    <div className={classes.root}>
      <Main
        platformInfo={platformInfo}
        onSettingsClick={() => setShowSettings(true)}
        onSave={onSave}
      />
    </div>
  );
}
