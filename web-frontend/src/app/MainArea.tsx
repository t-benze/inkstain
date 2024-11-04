import * as React from 'react';
import {
  TabList,
  Tab,
  makeStyles,
  tokens,
  shorthands,
  Button,
} from '@fluentui/react-components';
import { DismissRegular } from '@fluentui/react-icons';
import type { SelectTabData, SelectTabEvent } from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { DocumentView } from '~/web/components/DocumentView';
import { AppContext } from './context';

export interface MainAreaHandle {
  setActiveDocument: (name: string) => void;
}

const useClasses = makeStyles({
  root: { width: '0px', flexGrow: 1 },
  tabList: {
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderBottom(
      tokens.strokeWidthThin,
      'solid',
      tokens.colorNeutralStroke1
    ),
    overflowX: 'scroll',
    height: '32px',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
  tab: {
    '& .fui-Button': {
      visibility: 'hidden',
    },
    '&:hover .fui-Button': {
      visibility: 'visible',
    },
  },
  panel: {
    width: '100%',
    height: 'calc(100% - 32px)',
  },
});

const TabPanel = ({
  type,
  name,
  isActive,
}: {
  type: string;
  name: string;
  isActive: boolean;
}) => {
  const styles = useClasses();

  return (
    <div
      className={styles.panel}
      style={{ display: isActive ? 'block' : 'none' }}
    >
      <DocumentView type={type} name={name} isActive={isActive} />
    </div>
  );
};

export const MainArea = ({
  onActiveDocumentChange,
}: {
  onActiveDocumentChange: (name: string) => void;
}) => {
  const { closeDocument, documentsAlive, platform, activeDocument } =
    React.useContext(AppContext);
  const classes = useClasses();
  const { t } = useTranslation();

  const onTabSelect = (event: SelectTabEvent, data: SelectTabData) => {
    const document = documentsAlive.find((doc) => doc.name === data.value);
    if (document) {
      onActiveDocumentChange(document.name);
    }
  };

  return (
    <div className={classes.root}>
      <TabList
        className={classes.tabList}
        onTabSelect={onTabSelect}
        size="small"
        appearance="subtle"
        selectedValue={activeDocument}
      >
        {documentsAlive.map((document) => {
          const displayName = document.name.startsWith('@inkstain')
            ? t(`system.${document.type}`)
            : (document.name.split(platform.pathSep).pop() as string);
          return (
            <Tab
              key={document.name}
              value={document.name}
              className={classes.tab}
            >
              {displayName?.length > 20
                ? `${displayName.slice(0, 20)}...`
                : displayName}
              <Button
                appearance="transparent"
                size="small"
                icon={<DismissRegular fontSize={'16px'} />}
                onClick={() => {
                  closeDocument(document.name);
                }}
              />
            </Tab>
          );
        })}
      </TabList>

      {documentsAlive.map((document) => {
        return (
          <TabPanel
            type={document.type}
            name={document.name}
            key={document.name}
            isActive={document.name === activeDocument}
          />
        );
      })}
    </div>
  );
};
