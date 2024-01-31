import * as React from 'react';
import {
  shorthands,
  makeStyles,
  Text,
  Button,
  Tree,
  TreeItem,
  TreeItemLayout,
  Spinner,
  tokens,
} from '@fluentui/react-components';
import { DocumentAddRegular, FolderAddRegular } from '@fluentui/react-icons';
import { Space } from '~/web/types';
import { documentsApi } from '~/web/apiClient';
import { useQuery } from '@tanstack/react-query';

interface FileExplorerProps {
  space: Space;
}

const useStyles = makeStyles({
  root: {
    ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalS),
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    ...shorthands.padding(tokens.spacingVerticalXS),
  },
});

export const FileExplorer = ({ space }: FileExplorerProps) => {
  const styles = useStyles();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const onFileInputChange = React.useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Optional: Implement validation checks here

      // Prepare the FormData
      const formData = new FormData();
      formData.append('document', file);

      try {
        await documentsApi.documentsSpaceNameAddPost({
          spaceName: space.name,
          path: file.name,
          document: file,
        });
      } catch (error) {
        console.error(error);
      } finally {
        event.target.files = null;
      }
    },
    []
  );

  const {
    data: documents,
    isLoading: isDocumentsLoading,
    refetch: refetchDocuments,
  } = useQuery({
    queryKey: ['documents', space.name, '~'],
    queryFn: async () => {
      return await documentsApi.documentsSpaceNameListGet({
        spaceName: space.name,
        path: '~',
      });
    },
  });

  return (
    <div className={styles.root}>
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={onFileInputChange}
      />
      <div className={styles.header}>
        <Text>{space.name}</Text>
        <div>
          <Button
            appearance="subtle"
            size="small"
            icon={<DocumentAddRegular />}
            onClick={() => {
              fileInputRef.current?.click();
            }}
          />
          <Button
            appearance="subtle"
            size="small"
            icon={<FolderAddRegular />}
            onClick={() => {
              fileInputRef.current?.click();
            }}
          />
        </div>
      </div>
      <div>
        {isDocumentsLoading ? (
          <Spinner>Loading documents...</Spinner>
        ) : (
          <Tree>
            {documents?.map((document) => (
              <TreeItem
                itemType={document.type == 'folder' ? 'branch' : 'leaf'}
                key={document.name}
              >
                <TreeItemLayout>
                  <Text>{document.name}</Text>
                </TreeItemLayout>
              </TreeItem>
            ))}
          </Tree>
        )}
      </div>
    </div>
  );
};
