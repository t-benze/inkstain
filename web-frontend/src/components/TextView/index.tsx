import * as React from 'react';
import { Body2, makeStyles } from '@fluentui/react-components';
import { documentsApi } from '~/web/apiClient';
import { DocumentViewProps } from '~/web/types';

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

export function TextView({ documentPath, spaceKey }: DocumentViewProps) {
  const [text, setText] = React.useState<string | null>(null);
  const styles = useStyles();

  React.useEffect(() => {
    documentsApi
      .getDocumentContent({
        spaceKey: spaceKey,
        path: documentPath,
      })
      .then((response) => response.text()) // Convert response to string
      .then((content) => {
        setText(content);
      });
  }, [documentPath, spaceKey]);

  return text !== null ? (
    <div className={styles.root}>
      <Body2 className={styles.body} data-test="document-textView">
        {text}
      </Body2>
    </div>
  ) : null;
}
