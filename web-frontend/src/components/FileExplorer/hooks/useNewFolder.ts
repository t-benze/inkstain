import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppContext } from '~/web/app/hooks/useAppContext';
import { documentsApi } from '~/web/apiClient';
import { Select } from '../types';
import { getFolderPath } from '../utils';

export const useNewFolder = (spaceKey: string, lastSelect: Select | null) => {
  const appContext = useAppContext();
  const queryClient = useQueryClient();
  const [addNewFolderTarget, setAddNewFolderTarget] = React.useState<
    string | null
  >(null);
  const handleAddFolder = React.useCallback(() => {
    // const folder
    const targetFolder = lastSelect
      ? getFolderPath(lastSelect, appContext.platform.pathSep)
      : '';
    setAddNewFolderTarget(targetFolder);
  }, [setAddNewFolderTarget, lastSelect, appContext.platform.pathSep]);

  const { mutate: handleAddNewFolder } = useMutation({
    mutationFn: async ({
      targetFolder,
      name,
    }: {
      targetFolder: string;
      name: string;
    }) => {
      return await documentsApi.addFolder({
        spaceKey: spaceKey,
        path: targetFolder
          ? targetFolder + appContext.platform.pathSep + name
          : name,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['documents', spaceKey, addNewFolderTarget || ''],
      });
      setAddNewFolderTarget(null);
    },
  });
  return {
    handleAddFolder,
    handleAddNewFolder,
    addNewFolderTarget,
  };
};
