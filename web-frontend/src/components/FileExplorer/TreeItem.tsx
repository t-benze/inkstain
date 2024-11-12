import * as React from 'react';
import {
  Text,
  TreeItem,
  TreeItemValue,
  TreeOpenChangeEvent,
  TreeOpenChangeData,
  TreeItemLayout,
  mergeClasses,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { DocumentListItem } from '@inkstain/client-api';
import { RenameInput } from './RenameInput';
import { FolderTreeContext } from './context';

const useClasses = makeStyles({
  itemSelected: {
    backgroundColor: tokens.colorNeutralBackground2Selected,
  },
  itemLayout: {
    width: '100%',
  },
  itemText: {
    display: 'block',
    width: '100%',
  },
});

export type OnOpenChange = (
  event: TreeOpenChangeEvent,
  data: TreeOpenChangeData
) => void;

export type OnTreeItemClicked = (data: {
  event: React.MouseEvent;
  value: TreeItemValue;
  itemType: 'branch' | 'leaf';
}) => void;

interface FileTreeItemProps {
  document: DocumentListItem;
}

export const FileTreeItem = ({ document }: FileTreeItemProps) => {
  const classes = useClasses();
  const {
    handleTreeItemClicked,
    handleTreeItemContextMenu,
    renameTarget,
    selection,
    onRename,
  } = React.useContext(FolderTreeContext);
  const isRenaming = renameTarget && renameTarget === document.path;
  const isSelected = selection.some((s) => s.value === document.path);
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `draggable-${document.path}`,
    data: { type: 'file', path: document.path, name: document.name },
  });
  return (
    <TreeItem
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleTreeItemContextMenu &&
          handleTreeItemContextMenu({
            event: e,
            value: document.path,
            itemType: 'leaf',
          });
      }}
      onClick={(e) => {
        handleTreeItemClicked &&
          handleTreeItemClicked({
            event: e,
            value: document.path,
            itemType: 'leaf',
          });
      }}
      itemType={'leaf'}
      value={document.path}
    >
      <TreeItemLayout
        className={mergeClasses(
          classes.itemLayout,
          isSelected ? classes.itemSelected : undefined
        )}
        main={{ style: { width: '100%' } }}
      >
        {isRenaming ? (
          <RenameInput
            value={document.path}
            document={document}
            onRename={onRename}
          />
        ) : (
          <Text
            role="button"
            wrap={false}
            truncate={true}
            className={classes.itemText}
          >
            {document.name}
          </Text>
        )}
      </TreeItemLayout>
    </TreeItem>
  );
};

interface FolderTreeItemProps {
  document: DocumentListItem;
  level: number;
  FolderTree: React.FC<{
    path: string;
    level: number;
  }>;
}

export const FolderTreeItem = ({
  level,
  document,
  FolderTree,
}: FolderTreeItemProps) => {
  const classes = useClasses();
  const {
    handleTreeItemClicked,
    handleTreeItemContextMenu,
    onRename,
    renameTarget,
    selection,
  } = React.useContext(FolderTreeContext);
  const isRenaming = renameTarget && renameTarget === document.path;
  const isSelected = selection.some((s) => s.value === document.path);
  const {
    attributes,
    listeners,
    setNodeRef: setDragNodeRef,
  } = useDraggable({
    id: `draggable-${document.path}`,
    data: { type: 'folder', path: document.path, name: document.name },
  });
  const { isOver, setNodeRef: setDropNodeRef } = useDroppable({
    id: `droppable-${document.path}`,
    data: { type: 'folder', path: document.path, name: document.name },
  });
  const style = {
    backgroundColor: isOver ? tokens.colorBrandBackground2Hover : undefined,
  };

  return (
    <TreeItem
      ref={(ref) => {
        setDragNodeRef(ref);
        setDropNodeRef(ref);
      }}
      style={style}
      {...attributes}
      {...listeners}
      data-test={`fileExplorer-${document.type}`}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleTreeItemContextMenu &&
          handleTreeItemContextMenu({
            event: e,
            value: document.path,
            itemType: 'branch',
          });
      }}
      onClick={(e) => {
        handleTreeItemClicked &&
          handleTreeItemClicked({
            event: e,
            value: document.path,
            itemType: 'branch',
          });
      }}
      itemType={'branch'}
      value={document.path}
    >
      <TreeItemLayout
        className={mergeClasses(
          classes.itemLayout,
          isSelected ? classes.itemSelected : undefined
        )}
        main={{ style: { width: '100%' } }}
      >
        {isRenaming ? (
          <RenameInput
            value={document.path}
            document={document}
            onRename={onRename}
          />
        ) : (
          <Text
            role="button"
            wrap={false}
            truncate={true}
            className={classes.itemText}
          >
            {document.name}
          </Text>
        )}
      </TreeItemLayout>
      <FolderTree path={document.path} level={level + 1} />
    </TreeItem>
  );
};
