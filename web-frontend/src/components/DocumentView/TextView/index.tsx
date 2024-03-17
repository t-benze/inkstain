import * as React from 'react';
import { Body2, makeStyles } from '@fluentui/react-components';
import { AppContext } from '~/web/app/context';
import { documentsApi } from '~/web/apiClient';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  body: {
    width: '960px',
  },
});

export function TextView({ name }: { name: string }) {
  const { activeSpace } = React.useContext(AppContext);
  const [text, setText] = React.useState<string | null>(null);
  const styles = useStyles();

  React.useEffect(() => {
    if (activeSpace === null) throw new Error('No activeSpace');
    documentsApi
      .getDocumentContent({
        spaceKey: activeSpace.key,
        path: name,
      })
      .then((response) => response.text()) // Convert response to string
      .then((content) => {
        setText(content);
      });
  }, [name, activeSpace]);

  return text !== null ? (
    <div className={styles.root}>
      <Body2 className={styles.body} data-test="document-textView">
        {text}
      </Body2>
    </div>
  ) : null;
}
