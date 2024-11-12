import * as React from 'react';
import {
  shorthands,
  makeStyles,
  Button,
  TreeItemValue,
  Tooltip,
  tokens,
  Menu,
  Text,
  MenuProps,
  PositioningImperativeRef,
} from '@fluentui/react-components';
import {
  DocumentAddRegular,
  FolderAddRegular,
  FolderSyncRegular,
  ArrowCollapseAllRegular,
  SearchRegular,
} from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import {
  DndContext,
  DragOverlay,
  useDndContext,
  MouseSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import { Space } from '~/web/types';
import { AppContext } from '~/web/app/context';
import { FolderTree } from './FolderTree';
import { useQueryClient } from '@tanstack/react-query';
import { SidebarAccordionItem } from '~/web/components/SidebarAccordionItem';
import { FolderTreeContext } from './context';
import { ContextMenu } from './ContextMenu';
import { OnOpenChange, OnTreeItemClicked } from './types';
import { useSelection } from './hooks/useSelection';
import { useUploadFile } from './hooks/useUploadFile';
import { getFolderPath } from './utils';
import { useRename } from './hooks/useRename';
import { useNewFolder } from './hooks/useNewFolder';
import { useExport } from './hooks/useExportFile';
import { useDelete } from './hooks/useDelete';
import { useMove } from './hooks/useMove';

interface FileExplorerProps {
  space: Space;
}

const useClasses = makeStyles({
  root: {
    ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalS),
    height: '100%',
    overflowY: 'scroll',
    scrollbarWidth: 'none',
  },
});

const DragOverlayItem = () => {
  const { active } = useDndContext();
  console.log('over item', active);
  if (!active) return null;
  return <Text>{active.data.current?.name}</Text>;
};

const PanelWrapper = ({
  spaceKey,
  children,
}: {
  spaceKey: string;
  children: React.ReactNode;
}) => {
  const classes = useClasses();
  const { isOver, setNodeRef } = useDroppable({
    id: `droppable-root`,
    data: { type: 'folder', path: '', name: '' },
  });
  const style = {
    backgroundColor: isOver ? tokens.colorBrandBackground2Hover : undefined,
  };
  return (
    <div
      ref={setNodeRef}
      data-test="fileExplorer"
      data-space-key={spaceKey}
      className={classes.root}
      style={style}
    >
      {children}
    </div>
  );
};

const useContextMenu = () => {
  const [isContextMenuOpen, setOpen] = React.useState(false);
  const onContextMenuOpenChange: MenuProps['onOpenChange'] = (e, data) => {
    setOpen(data.open);
  };
  const positioningRef = React.useRef<PositioningImperativeRef>(null);
  const openContextMenu = React.useCallback((targetElement: HTMLElement) => {
    positioningRef.current?.setTarget(targetElement);
    setOpen(true);
  }, []);

  return {
    isContextMenuOpen,
    onContextMenuOpenChange,
    positioningRef,
    openContextMenu,
  };
};

export const FileExplorer = ({ space }: FileExplorerProps) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const appContext = React.useContext(AppContext);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [openItems, setOpenItems] = React.useState<Set<TreeItemValue>>(
    new Set()
  );
  const { lastSelect, clearSelection, selection, handleSelected } =
    useSelection();
  const { handleFileInputChange } = useUploadFile(space.key, lastSelect);
  const { addNewFolderTarget, handleAddFolder, handleAddNewFolder } =
    useNewFolder(space.key, lastSelect);
  const {
    isContextMenuOpen,
    onContextMenuOpenChange,
    positioningRef,
    openContextMenu,
  } = useContextMenu();

  const handleTreeItemClicked = React.useCallback<OnTreeItemClicked>(
    (e) => {
      handleSelected(e);
      if (e.event.type === 'click' && e.itemType === 'leaf') {
        appContext.openDocument(e.value.toString());
      }
    },
    [handleSelected, appContext]
  );
  const handleTreeItemContextMenu = React.useCallback<OnTreeItemClicked>(
    (e) => {
      handleSelected(e);
      openContextMenu(e.event.currentTarget as HTMLElement);
    },
    [handleSelected, openContextMenu]
  );
  const handleOpenChange = React.useCallback<OnOpenChange>(
    (_, data) => {
      setOpenItems(data.openItems);
    },
    [setOpenItems]
  );
  const openItem = React.useCallback(
    (item: string) => {
      setOpenItems((prev) => new Set([...prev, item]));
    },
    [setOpenItems]
  );

  const [renameTarget, setRenameTarget] = React.useState<string | null>(null);
  const handleRenameAction = React.useCallback(() => {
    if (lastSelect) {
      setRenameTarget(lastSelect.value);
    }
  }, [lastSelect]);
  const { handleRename, handleMove } = useRename(space.key);
  const { exportFile } = useExport(space.key, lastSelect);
  const { deleteFiles } = useDelete(space.key, selection);
  const { handleDragEnd, handleDragOver } = useMove(openItem, handleMove);
  const handleRenameItem = React.useCallback(
    (params: { target: string; newName: string; isFolder: boolean }) => {
      if (renameTarget) {
        handleRename(params);
        setRenameTarget(null);
      }
    },
    [renameTarget, handleRename]
  );
  const mouseSensor = useSensor(MouseSensor, {
    // Require the mouse to move by 5 pixels before activating
    activationConstraint: {
      distance: 5,
    },
  });
  const dndSensors = useSensors(mouseSensor);
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
            if (lastSelect) {
              const folder = getFolderPath(
                lastSelect,
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
    <DndContext
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragStart={() => {
        clearSelection();
      }}
      sensors={dndSensors}
    >
      <PanelWrapper spaceKey={space.key}>
        <input
          data-test="fileExplorer-fileInput"
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          onChange={handleFileInputChange}
        />
        <Menu
          open={isContextMenuOpen}
          onOpenChange={onContextMenuOpenChange}
          positioning={{ positioningRef: positioningRef, position: 'below' }}
        >
          <FolderTreeContext.Provider
            value={{
              spaceKey: space.key,
              openItems,
              selection,
              onOpenChange: handleOpenChange,
              handleTreeItemClicked: handleTreeItemClicked,
              handleTreeItemContextMenu: handleTreeItemContextMenu,
              addNewFolderTarget,
              onAddNewFolder: handleAddNewFolder,
              onRename: handleRenameItem,
              renameTarget: renameTarget,
            }}
          >
            <FolderTree path="" level={0} />
          </FolderTreeContext.Provider>
          <ContextMenu
            lastSelect={lastSelect}
            deleteFiles={deleteFiles}
            exportFile={exportFile}
            rename={handleRenameAction}
          />
        </Menu>
        <DragOverlay>
          <DragOverlayItem />
        </DragOverlay>
      </PanelWrapper>
    </DndContext>
  );
  return (
    <SidebarAccordionItem
      headerText={t('file_explorer._')}
      headerButtons={headerButtons}
      panel={panel}
    />
  );
};
