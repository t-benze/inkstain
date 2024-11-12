import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '~/web/apiClient';
import { useAppContext } from '~/web/app/hooks/useAppContext';

export const useRename = (spaceKey: string) => {
  const appContext = useAppContext();
  const queryClient = useQueryClient();

  const handleRenameFullPath = React.useCallback(
    async (params: { target: string; newPath: string; isFolder: boolean }) => {
      if (params.target === params.newPath) {
        return;
      }
      const parent = params.target
        .split(appContext.platform.pathSep)
        .slice(0, -1)
        .join(appContext.platform.pathSep);
      const newParent = params.newPath
        .split(appContext.platform.pathSep)
        .slice(0, -1)
        .join(appContext.platform.pathSep);
      try {
        if (params.isFolder) {
          await documentsApi.renameFolder({
            spaceKey: spaceKey,
            path: params.target,
            newPath: params.newPath,
          });
        } else {
          await documentsApi.renameDocument({
            spaceKey: spaceKey,
            path: params.target,
            newPath: params.newPath,
          });
        }
        appContext.renameDocumentPath({
          target: params.target,
          newPath: params.newPath,
          isFolder: params.isFolder,
        });
        queryClient.invalidateQueries({
          queryKey: ['documents', spaceKey, parent],
        });
        queryClient.invalidateQueries({
          queryKey: ['documents', spaceKey, newParent],
        });
      } catch (error) {
        console.error('Error renaming document or folder:', error);
      }
    },
    [spaceKey, queryClient, appContext]
  );

  const handleRename = React.useCallback(
    async (params: { target: string; newName: string; isFolder: boolean }) => {
      const parts = params.target.split(appContext.platform.pathSep);
      parts.pop();
      parts.push(params.newName);
      const newPath = parts.join(appContext.platform.pathSep);
      handleRenameFullPath({
        target: params.target,
        newPath: newPath,
        isFolder: params.isFolder,
      });
    },
    [handleRenameFullPath, appContext.platform.pathSep]
  );

  const handleMove = React.useCallback(
    async (params: {
      target: string;
      newFolder: string;
      isFolder: boolean;
    }) => {
      const name = params.target.split(appContext.platform.pathSep).pop();
      const newPath = `${params.newFolder}${appContext.platform.pathSep}${name}`;
      handleRenameFullPath({
        target: params.target,
        newPath: newPath,
        isFolder: params.isFolder,
      });
    },
    [handleRenameFullPath, appContext.platform.pathSep]
  );

  return {
    handleRename,
    handleMove,
  };
};
