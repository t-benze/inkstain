import * as React from 'react';
import {
  TreeItemValue,
  TreeOpenChangeData,
  TreeOpenChangeEvent,
} from '@fluentui/react-components';

type FolderTreeContextType = {
  spaceKey: string;
  openItems?: Set<TreeItemValue>;
  selection: Array<{ value: string; itemType: string }>;
  onOpenChange?: (event: TreeOpenChangeEvent, data: TreeOpenChangeData) => void;
  handleTreeItemClicked?: (data: {
    event: React.MouseEvent;
    value: TreeItemValue;
    itemType: 'branch' | 'leaf';
  }) => void;
  handleTreeItemContextMenu?: (data: {
    event: React.MouseEvent;
    value: TreeItemValue;
    itemType: 'branch' | 'leaf';
  }) => void;
  addNewFolderTarget: string | null;
  onAddNewFolder: (params: { targetFolder: string; name: string }) => void;
  renameTarget: string | null;
  onRename: (params: {
    target: string;
    newName: string;
    isFolder: boolean;
  }) => void;
};

export const FolderTreeContext = React.createContext<FolderTreeContextType>(
  {} as FolderTreeContextType
);
