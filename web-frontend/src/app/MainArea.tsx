import * as React from 'react';
import {
  TabList,
  Tab,
  makeStyles,
  tokens,
  shorthands,
} from '@fluentui/react-components';
import type { SelectTabData, SelectTabEvent } from '@fluentui/react-components';
import { DocumentView } from '~/web/components/DocumentView';
import { AppContext } from './context';

export interface MainAreaHandle {
  setActiveDocument: (name: string) => void;
}

const useStyles = makeStyles({
  root: { flexGrow: 1 },
  tabList: {
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderBottom(
      tokens.strokeWidthThin,
      'solid',
      tokens.colorNeutralStroke1
    ),
    height: '32px',
  },
  panel: {
    width: '100%',
    height: 'calc(100% - 32px)',
    ...shorthands.overflow('hidden'),
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
  const styles = useStyles();
  return (
    <div
      className={styles.panel}
      style={{ display: isActive ? 'block' : 'none' }}
    >
      <DocumentView type={type} name={name} isActive={isActive} />
    </div>
  );
};

export const MainArea = () => {
  const { documentsAlive, setActiveDocument, activeDocument } =
    React.useContext(AppContext);
  const styles = useStyles();

  const onTabSelect = (event: SelectTabEvent, data: SelectTabData) => {
    const document = documentsAlive.find((doc) => doc.name === data.value);
    if (document) {
      setActiveDocument(document.name);
    }
  };

  return (
    <div className={styles.root}>
      <TabList
        className={styles.tabList}
        onTabSelect={onTabSelect}
        size="small"
        appearance="subtle"
      >
        {documentsAlive.map((document) => {
          return (
            <Tab key={document.name} value={document.name}>
              {document.name === '' ? document.type : document.name}
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
