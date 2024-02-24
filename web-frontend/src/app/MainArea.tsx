import * as React from 'react';
import { TabList, Tab, makeStyles } from '@fluentui/react-components';
import type { SelectTabData, SelectTabEvent } from '@fluentui/react-components';
import { DocumentView } from '~/web/components/DocumentView';
import { Document } from '../types';
import { AppContext } from './context';

interface MainAreaProps {
  //   documentsAlive: Document[];
}

const useStyles = makeStyles({
  root: { width: '100%' },
  panelArea: {},
  panel: {
    width: '100%',
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
      <DocumentView type={type} name={name} />
    </div>
  );
};

export const MainArea = ({}: MainAreaProps) => {
  const { documentsAlive } = React.useContext(AppContext);
  const [activeDocument, setActiveDocument] = React.useState<Document | null>(
    documentsAlive[0] ? documentsAlive[0] : null
  );
  const styles = useStyles();

  React.useEffect(() => {
    if (activeDocument === null && documentsAlive.length > 0) {
      setActiveDocument(documentsAlive[0]);
    }
  }, [documentsAlive, activeDocument]);

  const onTabSelect = (event: SelectTabEvent, data: SelectTabData) => {
    setActiveDocument(
      documentsAlive.find((document) => document.name === data.value) ?? null
    );
  };

  if (documentsAlive.length === 0) {
    return <div>Welcome to InkStain</div>;
  }

  return (
    <div className={styles.root}>
      <TabList onTabSelect={onTabSelect} size="small" appearance="subtle">
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
            isActive={document.name === activeDocument?.name}
          />
        );
      })}
    </div>
  );
};
