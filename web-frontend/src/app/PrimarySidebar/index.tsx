import * as React from 'react';
import { makeStyles, tokens, shorthands } from '@fluentui/react-components';
import { AppContext } from '~/web/app/context';
import {} from '~/web/types';
import { FileExplorer } from '~/web/components/FileExplorer';
const useStyles = makeStyles({
  root: {
    width: '240px',
    backgroundColor: tokens.colorNeutralBackground4,
    ...shorthands.borderRight(
      tokens.strokeWidthThin,
      'solid',
      tokens.colorNeutralStroke1
    ),
  },
});

const NoSpaceSelected = () => {
  return <div>No space selected</div>;
};

export const PrimarySidebar = () => {
  const styles = useStyles();
  const { activeSpace } = React.useContext(AppContext);

  return (
    <div className={styles.root}>
      {!activeSpace ? (
        <NoSpaceSelected />
      ) : (
        <FileExplorer space={activeSpace} />
      )}
    </div>
  );
};
