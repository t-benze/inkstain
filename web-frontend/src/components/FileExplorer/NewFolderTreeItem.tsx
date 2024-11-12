import * as React from 'react';
import { Input, TreeItem, TreeItemLayout } from '@fluentui/react-components';

interface NewFolderTreeItemProps {
  onAddNewFolder: (params: { targetFolder: string; name: string }) => void;
  currentFolder: string;
}
export const NewFolderTreeItem = ({
  currentFolder,
  onAddNewFolder,
}: NewFolderTreeItemProps) => {
  const [newFolderName, setNewFolderName] = React.useState<string>('');
  const newFolderInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <TreeItem
      key="add-new-folder"
      itemType="branch"
      value={`add-folder-${currentFolder}`}
    >
      <TreeItemLayout>
        <Input
          data-test="fileExplorer-newFolderNameInput"
          size="small"
          ref={newFolderInputRef}
          value={newFolderName}
          onClick={(e) => {
            // prevent propagation to TreeItem
            e.stopPropagation();
          }}
          onChange={(e, data) => {
            setNewFolderName(data.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onAddNewFolder({
                targetFolder: currentFolder,
                name: newFolderName,
              });
            }
          }}
          onBlur={() => {
            onAddNewFolder({
              targetFolder: currentFolder,
              name: newFolderName,
            });
          }}
        />
      </TreeItemLayout>
    </TreeItem>
  );
};
