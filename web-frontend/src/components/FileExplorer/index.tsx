import * as React from 'react';
import {
  shorthands,
  makeStyles,
  Button,
  TreeItemValue,
  Tooltip,
  tokens,
  Toast,
  ToastTitle,
  ToastBody,
  useToastController,
  useId,
  ProgressBar,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
} from '@fluentui/react-components';
import {
  DocumentAddRegular,
  FolderAddRegular,
  FolderSyncRegular,
  ArrowCollapseAllRegular,
  SearchRegular,
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
  const [lastSelect, setLastSelect] = React.useState<{
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
      setLastSelect({
        value,
        itemType: data.itemType,
      });
    },
    [selection, setSelection, setLastSelect]
  );

  return {
    lastSelect,
    selection,
    handleSelected,
  } as const;
};

const ContextMenu = ({
  lastSelect,
  deleteFiles,
  exportFile,
}: {
  lastSelect: {
    value: string;
    itemType: string;
  } | null;
  deleteFiles: () => void;
  exportFile: (withData: boolean) => void;
}) => {
  const { t } = useTranslation();
  const enableExport = lastSelect && lastSelect?.itemType === 'leaf';
  return (
    <MenuPopover>
      <MenuList>
        <MenuItem data-test="fileExplorer-contextDelete" onClick={deleteFiles}>
          {t('delete')}
        </MenuItem>
        <MenuItem
          data-test="fileExplorer-exportDocument"
          onClick={() => {
            exportFile(false);
          }}
          disabled={!enableExport}
        >
          {t('file_explorer.export_raw')}
        </MenuItem>
        <MenuItem
          data-test="fileExplorer-exportDocumentWithData"
          onClick={() => {
            exportFile(true);
          }}
          disabled={!enableExport}
        >
          {t('file_explorer.export_with_data')}
        </MenuItem>
      </MenuList>
    </MenuPopover>
  );
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
      if (e.event.type === 'click' && e.itemType === 'leaf') {
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

  const toastId = useId('toast');
  const { dispatchToast, updateToast } = useToastController(
    appContext.toasterId
  );
  const handleFileInputChange = React.useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) throw new Error('No file selected');
      const formData = new FormData();
      formData.append('document', file);
      const folder = lastSelect
        ? getFolderPath(lastSelect, appContext.platform.pathSep)
        : '';
      const path =
        folder === ''
          ? file.name
          : `${folder}${appContext.platform.pathSep}${file.name}`;
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `/api/v1/documents/${space.key}/add?path=${path}`, true);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          updateToast({
            toastId,
            content: (
              <Toast>
                <ToastTitle>{t('file_explorer.adding_document')}</ToastTitle>
                <ToastBody>
                  <ProgressBar max={100} value={percentComplete} />
                </ToastBody>
              </Toast>
            ),
          });
        }
      };
      xhr.onload = () => {
        if (xhr.status === 201) {
          updateToast({
            toastId,
            content: (
              <Toast>
                <ToastTitle>{t('file_explorer.adding_document')}</ToastTitle>
                <ToastBody>
                  {t('file_explorer.adding_document_succeeded')}
                </ToastBody>
              </Toast>
            ),
            timeout: 500,
            intent: 'success',
          });
          queryClient.invalidateQueries({
            queryKey: ['documents', space.key, folder],
          });
          queryClient.invalidateQueries({
            queryKey: ['searchDocuments', space.key, '', '', 0],
          });
        } else {
          console.error('Adding document failed at uploading');
          updateToast({
            toastId,
            intent: 'error',
            content: (
              <Toast>
                <ToastTitle>{t('file_explorer.adding_document')}</ToastTitle>
                <ToastBody>
                  {t('file_explorer.adding_document_failed')}
                </ToastBody>
              </Toast>
            ),
            timeout: 500,
          });
        }
      };
      xhr.onerror = (e) => {
        console.error('Adding document failed', e);
        updateToast({
          toastId,
          intent: 'error',
          content: (
            <Toast>
              <ToastTitle>{t('file_explorer.adding_document')}</ToastTitle>
              <ToastBody>{t('file_explorer.adding_document_failed')}</ToastBody>
            </Toast>
          ),
          timeout: 500,
        });
      };
      xhr.send(formData);
      dispatchToast(
        <Toast>
          <ToastTitle>{t('file_explorer.adding_document')}</ToastTitle>
          <ToastBody>
            <ProgressBar max={100} value={0} />
          </ToastBody>
        </Toast>,
        {
          intent: 'info',
          position: 'top',
          timeout: -1,
          toastId,
        }
      );
    },
    [
      space.key,
      updateToast,
      lastSelect,
      appContext.platform.pathSep,
      dispatchToast,
      toastId,
      t,
      queryClient,
    ]
  );

  const handleAddFolder = React.useCallback(() => {
    // const folder
    const targetFolder = lastSelect
      ? getFolderPath(lastSelect, appContext.platform.pathSep)
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
    if (lastSelect) {
      const folder = getFolderPath(lastSelect, appContext.platform.pathSep);
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
      selection.size > 1 ? selection : lastSelect ? [lastSelect.value] : [];
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
    queryClient.invalidateQueries({
      queryKey: ['searchDocuments', space.key, '', '', 0],
    });
  }, [
    selection,
    appContext.platform.pathSep,
    space.key,
    lastSelect,
    queryClient,
  ]);

  const exportFile = React.useCallback(
    async (withData: boolean) => {
      if (lastSelect) {
        try {
          console.log('export file', lastSelect.value);
          const response = await documentsApi.exportDocumentRaw({
            spaceKey: space.key,
            path: lastSelect.value,
            withData: withData ? '1' : '0',
          });

          if (!response.raw.ok) {
            throw new Error('Export failed');
          }
          // Get the filename from the Content-Disposition header
          const contentDisposition = response.raw.headers.get(
            'Content-Disposition'
          );
          const filenameMatch =
            contentDisposition &&
            contentDisposition.match(/filename="?(.+)"?/i);
          const filename = filenameMatch
            ? filenameMatch[1]
            : 'exported-document';

          // Create a Blob from the response
          const blob = await response.raw.blob();

          // Create a temporary URL for the Blob
          const url = window.URL.createObjectURL(blob);

          // Create a temporary anchor element and trigger the download
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();

          // Clean up
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } catch (error) {
          console.error('Error exporting document:', error);
          // Handle the error (e.g., show an error message to the user)
        }
      }
    },
    [lastSelect, space.key]
  );

  const headerButtons = (
    <>
      <Tooltip
        content={t('file_explorer.search_documents')}
        relationship="label"
        positioning={'below'}
      >
        <Button
          data-test="fileExplorer-searchDocuments"
          appearance="subtle"
          size="small"
          icon={<SearchRegular />}
          onClick={(e) => {
            e.stopPropagation();
            appContext.openSystemDocument('@inkstain/search-document');
          }}
        />
      </Tooltip>
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
          onClick={(e) => {
            e.stopPropagation();
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
          onClick={(e) => {
            e.stopPropagation();
            handleAddFolder();
          }}
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
          onClick={(e) => {
            e.stopPropagation();
            handleSyncFolder();
          }}
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
          onClick={(e) => {
            e.stopPropagation();
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
      <Menu openOnContext positioning="below-end">
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
        />
        <ContextMenu
          lastSelect={lastSelect}
          deleteFiles={deleteFiles}
          exportFile={exportFile}
        />
      </Menu>
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
