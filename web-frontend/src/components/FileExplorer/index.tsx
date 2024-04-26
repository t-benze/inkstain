import * as React from 'react';
import {
  shorthands,
  makeStyles,
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
import { SidebarAccordionItem } from '~/web/components/SidebarAccordionItem';

interface FileExplorerProps {
  space: Space;
}

const useStyles = makeStyles({
  root: {
    ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalS),
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
  const lastSelect = React.useRef<{
    value: string;
    itemType: string;
  } | null>(null);
  const [selection, setSelection] = React.useState<Set<string>>(new Set());

  // TODO: support multi-select properly
  const handleSelected = React.useCallback<OnTreeItemClicked>(
    (data) => {
      const value = data.value.toString();
      if (data.event.shiftKey) {
        // Shift is held: Select the range from the last selected item to the clicked item
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
      lastSelect.current = {
        value,
        itemType: data.itemType,
      };
    },
    [selection, setSelection]
  );

  return {
    lastSelect,
    selection,
    handleSelected,
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
  const { lastSelect, selection, handleSelected } = useSelection();
  const [addNewFolderTarget, setAddNewFolderTarget] = React.useState<
    string | null
  >(null);

  const handleTreeItemClicked = React.useCallback<OnTreeItemClicked>(
    (e) => {
      handleSelected(e);
      if (e.itemType === 'leaf') {
        appContext.openDocument(e.value.toString());
      }
    },
    [handleSelected, appContext]
  );
  const handleTreeItemDoubleClicked = React.useCallback<OnTreeItemClicked>(
    (e) => {
      handleSelected(e);
    },
    [handleSelected]
  );
  const handleOpenChange = React.useCallback<OnOpenChange>(
    (_, data) => {
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
      const folder = lastSelect.current
        ? getFolderPath(lastSelect.current, appContext.platform.pathSep)
        : '';
      try {
        await documentsApi.addDocument({
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
    [space.key, lastSelect, appContext.platform.pathSep, queryClient]
  );

  const handleAddFolder = React.useCallback(() => {
    // const folder
    const targetFolder = lastSelect.current
      ? getFolderPath(lastSelect.current, appContext.platform.pathSep)
      : '';
    setAddNewFolderTarget(targetFolder);
  }, [setAddNewFolderTarget, lastSelect, appContext.platform.pathSep]);

  const { mutate: addFolder } = useMutation({
    mutationFn: async ({
      targetFolder,
      name,
    }: {
      targetFolder: string;
      name: string;
    }) => {
      return await documentsApi.addFolder({
        spaceKey: space.key,
        path: targetFolder
          ? targetFolder + appContext.platform.pathSep + name
          : name,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['documents', space.key, addNewFolderTarget || ''],
      });
      setAddNewFolderTarget(null);
    },
  });

  const handleSyncFolder = React.useCallback(() => {
    if (lastSelect.current) {
      const folder = getFolderPath(
        lastSelect.current,
        appContext.platform.pathSep
      );
      queryClient.invalidateQueries({
        queryKey: ['documents', space.key, folder],
      });
    } else {
      queryClient.invalidateQueries({
        queryKey: ['documents', space.key, ''],
      });
    }
  }, [lastSelect, appContext.platform.pathSep, space.key, queryClient]);

  const deleteFiles = React.useCallback(async () => {
    const filesToDelete =
      selection.size > 1
        ? selection
        : lastSelect.current
        ? [lastSelect.current.value]
        : [];
    const foldersToRefresh = new Set<string>();
    for (const file of filesToDelete) {
      if (file.endsWith(appContext.platform.pathSep)) {
        await documentsApi.deleteFolder({
          spaceKey: space.key,
          path: file,
        });
      } else {
        await documentsApi.deleteDocument({
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
    foldersToRefresh.forEach((folder) => {
      queryClient.invalidateQueries({
        queryKey: ['documents', space.key, folder],
      });
    });
  }, [
    selection,
    appContext.platform.pathSep,
    space.key,
    lastSelect,
    queryClient,
  ]);
  const headerButtons = (
    <>
      <Tooltip
        content={t('file_explorer.add_a_document_tooltip')}
        relationship="label"
        positioning={'below'}
      >
        <Button
          data-test="fileExplorer-addDocumentBtn"
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
          data-test="fileExplorer-addFolderBtn"
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
          data-test="fileExplorer-refreshFolderBtn"
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
          data-test="fileExplorer-collapseAllBtn"
          appearance="subtle"
          size="small"
          icon={<ArrowCollapseAllRegular />}
          onClick={() => {
            setOpenItems(new Set());
          }}
        />
      </Tooltip>
    </>
  );
  const panel = (
    <div
      data-test="fileExplorer"
      data-space-key={space.key}
      className={styles.root}
    >
      <input
        data-test="fileExplorer-fileInput"
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />
      <FolderTree
        spaceKey={space.key}
        path=""
        selection={selection}
        openItems={openItems}
        onOpenChange={handleOpenChange}
        onTreeItemClicked={handleTreeItemClicked}
        onTreeItemDoubleClicked={handleTreeItemDoubleClicked}
        addNewFolderTarget={addNewFolderTarget}
        addFolder={addFolder}
        deleteFiles={deleteFiles}
      />
    </div>
  );
  return (
    <SidebarAccordionItem
      headerText={t('file_explorer._')}
      headerButtons={headerButtons}
      panel={panel}
    />
  );
};
