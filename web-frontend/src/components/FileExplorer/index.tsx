import * as React from 'react';
import { makeStyles, Text, Button } from '@fluentui/react-components';
import { Space } from '~/web/types';

interface FileExplorerProps {
  space: Space;
}

const useStyles = makeStyles({
  root: {},
});

export const FileExplorer = ({ space }: FileExplorerProps) => {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <Text>{space.name}</Text>
    </div>
  );
};
