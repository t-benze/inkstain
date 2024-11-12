import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Select } from '../types';
import { documentsApi } from '~/web/apiClient';
import { useAppContext } from '~/web/app/hooks/useAppContext';

export const useDelete = (spaceKey: string, selection: Select[]) => {
  const queryClient = useQueryClient();
  const appContext = useAppContext();
  const deleteFiles = React.useCallback(async () => {
    const filesToDelete = selection;
    const foldersToRefresh = new Set<string>();
    for (const file of filesToDelete) {
      if (file.itemType === 'branch') {
        await documentsApi.deleteFolder({
          spaceKey: spaceKey,
          path: file.value,
        });
      } else {
        await documentsApi.deleteDocument({
          spaceKey: spaceKey,
          path: file.value,
        });
      }
      foldersToRefresh.add(
        file.value
          .split(appContext.platform.pathSep)
          .slice(0, file.value.endsWith(appContext.platform.pathSep) ? -2 : -1)
          .join(appContext.platform.pathSep)
      );
    }
    foldersToRefresh.forEach((folder) => {
      queryClient.invalidateQueries({
        queryKey: ['documents', spaceKey, folder],
      });
    });
    queryClient.invalidateQueries({
      queryKey: ['searchDocuments', spaceKey, '', '', 0],
    });
  }, [selection, appContext.platform.pathSep, spaceKey, queryClient]);
  return {
    deleteFiles,
  };
};
