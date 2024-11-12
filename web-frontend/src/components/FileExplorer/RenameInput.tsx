import * as React from 'react';
import { Input } from '@fluentui/react-components';
import { DocumentListItem } from '@inkstain/client-api';

interface RenameInputProps {
  value: string;
  document: DocumentListItem;
  onRename: (params: {
    target: string;
    newName: string;
    isFolder: boolean;
  }) => void;
}

export const RenameInput = ({
  value,
  onRename,
  document,
}: RenameInputProps) => {
  const [renameTargetValue, setRenameTargetValue] = React.useState<string>('');
  const renameTargetInputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    renameTargetInputRef.current?.focus();
  }, []);
  return (
    <Input
      size="small"
      data-test="fileExplorer-renameInput"
      ref={renameTargetInputRef}
      value={renameTargetValue}
      onClick={(e) => {
        e.stopPropagation();
      }}
      onChange={(e, data) => {
        setRenameTargetValue(data.value);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onRename({
            target: value,
            newName: renameTargetValue,
            isFolder: document.type === 'folder',
          });
        }
      }}
      onBlur={() => {
        onRename({
          target: value,
          newName: renameTargetValue,
          isFolder: document.type === 'folder',
        });
      }}
    />
  );
};
