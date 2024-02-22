import * as React from 'react';
import {
  shorthands,
  makeStyles,
  Text,
  Button,
  TreeItemValue,
  Tooltip,
  tokens,
} from '@fluentui/react-components';
import {
  DocumentAddRegular,
  FolderAddRegular,
  FolderSyncRegular,
  ArrowCollapseAllRegular,
} from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import { Space } from '~/web/types';
import { documentsApi } from '~/web/apiClient';
import { AppContext } from '~/web/app/context';
import { OnTreeItemClicked, FolderTree, OnOpenChange } from './FolderTree';
import { useMutation, useQueryClient } from '@tanstack/react-query';

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

const getFolderPath = (
  {
    value,
    itemType,
  }: {
    value: string;
    itemType: string;
  },
  pathSep: string
) => {
  if (itemType === 'branch') {
    return value;
  }
  const path = value;
  if (path.lastIndexOf(pathSep) !== -1) {
    return path.slice(0, path.lastIndexOf(pathSep));
  }
  return '';
};

const useSelection = () => {
  const lastClick = React.useRef<{
    value: string;
    itemType: string;
  } | null>(null);
  const [selection, setSelection] = React.useState<Set<string>>(new Set());

  const handleItemClicked = React.useCallback<OnTreeItemClicked>(
    (data) => {
      const value = data.value.toString();
      if (data.event.shiftKey) {
        // Shift is held: Select the range from the last selected item to the clicked item
        // TODO: find the range of items between lastSelected and data.value
        // setSelection(new Set([...selection, ...range]));
      } else if (data.event.ctrlKey || data.event.metaKey) {
        // Use metaKey to support Command key on macOS
        // Ctrl or Command is held: Toggle selection of the clicked item
        if (selection.has(value)) {
          selection.delete(value);
        } else {
          selection.add(value);
        }
      } else {
        // No modifier keys: Select only the clicked item (and deselect others)
        setSelection(new Set([value]));
      }
      lastClick.current = {
        value,
        itemType: data.itemType,
      };
    },
    [selection, setSelection]
  );

  return {
    lastClick,
    selection,
    handleItemClicked,
  } as const;
};

export const FileExplorer = ({ space }: FileExplorerProps) => {
  const styles = useStyles();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const appContext = React.useContext(AppContext);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [openItems, setOpenItems] = React.useState<Set<TreeItemValue>>(
    new Set()
  );
  const { lastClick, selection, handleItemClicked } = useSelection();
  const [addNewFolderTarget, setAddNewFolderTarget] = React.useState<
    string | null
  >(null);

  const handleOpenChange = React.useCallback<OnOpenChange>(
    (_, data) => {
      console.log('on open change', data);
      setOpenItems(data.openItems);
    },
    [setOpenItems]
  );

  const handleFileInputChange = React.useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) throw new Error('No file selected');
      const formData = new FormData();
      formData.append('document', file);
      const folder = lastClick.current
        ? getFolderPath(lastClick.current, appContext.platform.pathSep)
        : '';
      try {
        await documentsApi.documentsSpaceKeyAddPost({
          spaceKey: space.key,
          path:
            folder === ''
              ? file.name
              : `${folder}${appContext.platform.pathSep}${file.name}`,
          document: file,
        });
        queryClient.invalidateQueries({
          queryKey: ['documents', space.key, folder],
        });
      } catch (error) {
        console.error(error);
      } finally {
        event.target.files = null;
      }
    },
    [space.key, lastClick, appContext.platform.pathSep, queryClient]
  );

  const handleAddFolder = React.useCallback(() => {
    // const folder
    const targetFolder = lastClick.current
      ? getFolderPath(lastClick.current, appContext.platform.pathSep)
      : '';
    setAddNewFolderTarget(targetFolder);
  }, [setAddNewFolderTarget, lastClick, appContext.platform.pathSep]);

  const { mutate: addFolder } = useMutation({
    mutationFn: async ({
      targetFolder,
      name,
    }: {
      targetFolder: string;
      name: string;
    }) => {
      return await documentsApi.documentsSpaceKeyAddFolderPost({
        spaceKey: space.key,
        path: targetFolder
          ? targetFolder + appContext.platform.pathSep + name
          : name,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['documents', space.name, addNewFolderTarget || ''],
      });
      setAddNewFolderTarget(null);
    },
  });

  const handleSyncFolder = React.useCallback(() => {
    if (lastClick.current) {
      const folder = getFolderPath(
        lastClick.current,
        appContext.platform.pathSep
      );
      queryClient.invalidateQueries({
        queryKey: ['documents', space.name, folder],
      });
    } else {
      queryClient.invalidateQueries({
        queryKey: ['documents', space.name, ''],
      });
    }
  }, [lastClick, appContext.platform.pathSep, space.name, queryClient]);

  const deleteFiles = React.useCallback(async () => {
    const filesToDelete =
      selection.size > 1
        ? selection
        : lastClick.current
        ? [lastClick.current.value]
        : [];
    const foldersToRefresh = new Set<string>();
    for (const file of filesToDelete) {
      if (file.endsWith(appContext.platform.pathSep)) {
        await documentsApi.documentsSpaceKeyDeleteFolderDelete({
          spaceKey: space.key,
          path: file,
        });
      } else {
        await documentsApi.documentsSpaceKeyDeleteDelete({
          spaceKey: space.key,
          path: file,
        });
      }
      foldersToRefresh.add(
        file
          .split(appContext.platform.pathSep)
          .slice(0, file.endsWith(appContext.platform.pathSep) ? -2 : -1)
          .join(appContext.platform.pathSep)
      );
    }
    console.log('refresh folder, foldersToRefresh', foldersToRefresh);
    foldersToRefresh.forEach((folder) => {
      console.log('invalidate', folder);
      queryClient.invalidateQueries({
        queryKey: ['documents', space.key, folder],
      });
    });
  }, [
    selection,
    appContext.platform.pathSep,
    space.key,
    lastClick,
    queryClient,
  ]);

  return (
    <div className={styles.root}>
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />
      <div className={styles.header}>
        <Text>{space.name}</Text>
        <div>
          <Tooltip
            content={t('file_explorer.add_a_document_tooltip')}
            relationship="label"
            positioning={'below'}
          >
            <Button
              appearance="subtle"
              size="small"
              icon={<DocumentAddRegular />}
              onClick={() => {
                fileInputRef.current?.click();
              }}
            />
          </Tooltip>
          <Tooltip
            content={t('file_explorer.add_a_folder_tooltip')}
            relationship="label"
            positioning={'below'}
          >
            <Button
              appearance="subtle"
              size="small"
              icon={<FolderAddRegular />}
              onClick={handleAddFolder}
            />
          </Tooltip>
          <Tooltip
            content={t('file_explorer.refresh_folder_tooltip')}
            relationship="label"
            positioning={'below'}
          >
            <Button
              appearance="subtle"
              size="small"
              icon={<FolderSyncRegular />}
              onClick={handleSyncFolder}
            />
          </Tooltip>
          <Tooltip
            content={t('file_explorer.collapse_all_tooltip')}
            relationship="label"
            positioning={'below'}
          >
            <Button
              appearance="subtle"
              size="small"
              icon={<ArrowCollapseAllRegular />}
              onClick={() => {
                setOpenItems(new Set());
              }}
            />
          </Tooltip>
        </div>
      </div>
      <FolderTree
        spaceKey={space.key}
        path=""
        selection={selection}
        openItems={openItems}
        onOpenChange={handleOpenChange}
        onTreeItemClicked={handleItemClicked}
        addNewFolderTarget={addNewFolderTarget}
        addFolder={addFolder}
        deleteFiles={deleteFiles}
      />
    </div>
  );
};
