import * as React from 'react';
import { Tree, Spinner } from '@fluentui/react-components';
import { useQuery } from '@tanstack/react-query';
import { documentsApi } from '~/web/apiClient';
import { AppContext } from '~/web/app/context';
import { NewFolderTreeItem } from './NewFolderTreeItem';
import { FileTreeItem, FolderTreeItem } from './TreeItem';
import { FolderTreeContext } from './context';

interface FolderTreeProps {
  path: string;
  level: number;
}

export const FolderTree = ({ path, level }: FolderTreeProps) => {
  const {
    spaceKey,
    openItems,
    onOpenChange,
    addNewFolderTarget,
    onAddNewFolder,
  } = React.useContext(FolderTreeContext);
  const appContext = React.useContext(AppContext);
  const currentFolder = path.endsWith(appContext.platform.pathSep)
    ? path.slice(0, -appContext.platform.pathSep.length)
    : path;
  const { data, isLoading } = useQuery({
    queryKey: ['documents', spaceKey, currentFolder],
    queryFn: async () => {
      return await documentsApi.listDocuments({
        spaceKey: spaceKey,
        path,
      });
    },
    enabled: level === 0 || Boolean(openItems?.has(path)),
  });

  return isLoading ? (
    <Spinner></Spinner>
  ) : (
    <Tree
      data-test={level === 0 ? 'fileExplorer-folderTree' : undefined}
      aria-label="File folder tree"
      openItems={openItems}
      onOpenChange={onOpenChange}
    >
      {addNewFolderTarget !== null && addNewFolderTarget === currentFolder ? (
        <NewFolderTreeItem
          currentFolder={currentFolder}
          onAddNewFolder={onAddNewFolder}
        />
      ) : null}
      {data?.map((document) => {
        return document.type === 'folder' ? (
          <FolderTreeItem
            document={document}
            level={level + 1}
            FolderTree={FolderTree}
          />
        ) : (
          <FileTreeItem document={document} />
        );
      })}
    </Tree>
  );
};
