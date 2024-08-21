import * as React from 'react';
import {
  tokens,
  Tree,
  Text,
  Spinner,
  TreeItem,
  TreeItemLayout,
  TreeOpenChangeData,
  TreeOpenChangeEvent,
  TreeItemValue,
  makeStyles,
  Input,
  mergeClasses,
  MenuTrigger,
} from '@fluentui/react-components';
import { useQuery } from '@tanstack/react-query';
import { documentsApi } from '~/web/apiClient';
import { AppContext } from '~/web/app/context';

export type OnOpenChange = (
  event: TreeOpenChangeEvent,
  data: TreeOpenChangeData
) => void;

export type OnTreeItemClicked = (data: {
  event: React.MouseEvent;
  value: TreeItemValue;
  itemType: 'branch' | 'leaf';
}) => void;

interface FolderTreeProps {
  spaceKey: string;
  path: string;
  level?: number;
  openItems?: Set<TreeItemValue>;
  onOpenChange?: OnOpenChange;
  selection: Array<{ value: string; itemType: string }>;
  onTreeItemClicked?: OnTreeItemClicked;
  onTreeItemDoubleClicked?: OnTreeItemClicked;
  addNewFolderTarget: string | null;
  onAddNewFolder: (params: { targetFolder: string; name: string }) => void;
  renameTarget: string | null;
  onRename: (params: {
    target: string;
    newName: string;
    isFolder: boolean;
  }) => void;
}

const useStyles = makeStyles({
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

export const FolderTree = ({
  spaceKey,
  path,
  openItems,
  onOpenChange,
  level = 0,
  selection,
  onTreeItemClicked,
  onTreeItemDoubleClicked,
  addNewFolderTarget,
  onAddNewFolder,
  renameTarget,
  onRename,
}: FolderTreeProps) => {
  const styles = useStyles();
  const appContext = React.useContext(AppContext);
  const currentFolder = path.endsWith(appContext.platform.pathSep)
    ? path.slice(0, -appContext.platform.pathSep.length)
    : path;
  const { data, isLoading } = useQuery({
    queryKey: ['documents', spaceKey, currentFolder],
    queryFn: async () => {
      return await documentsApi.listDocuments({
        spaceKey: spaceKey,
        path,
      });
    },
    enabled: level === 0 || Boolean(openItems?.has(path)),
  });
  const [newFolderName, setNewFolderName] = React.useState<string>('');
  const newFolderInputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    setNewFolderName('');
    if (newFolderInputRef.current) {
      newFolderInputRef.current.focus();
    }
  }, [addNewFolderTarget]);

  const [renameTargetValue, setRenameTargetValue] = React.useState<string>('');
  const renameTargetInputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (renameTarget) {
      const doc = data?.find((d) => d.path === renameTarget);
      if (doc) {
        setRenameTargetValue(doc.name);
        if (renameTargetInputRef.current) {
          renameTargetInputRef.current.focus();
        }
      }
    }
  }, [renameTarget, data]);

  return isLoading ? (
    <Spinner></Spinner>
  ) : (
    <Tree
      data-test={level === 0 ? 'fileExplorer-folderTree' : undefined}
      aria-label="File folder tree"
      openItems={openItems}
      onOpenChange={onOpenChange}
    >
      {addNewFolderTarget !== null && addNewFolderTarget === currentFolder ? (
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
      ) : null}
      {data?.map((document) => {
        const value = document.path;
        const itemType = document.type === 'folder' ? 'branch' : 'leaf';
        return (
          <MenuTrigger disableButtonEnhancement key={document.path}>
            <TreeItem
              data-test={`fileExplorer-${document.type}`}
              onContextMenu={(e) => {
                e.stopPropagation();
                onTreeItemClicked &&
                  onTreeItemClicked({
                    event: e,
                    value: value,
                    itemType,
                  });
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                onTreeItemDoubleClicked &&
                  onTreeItemDoubleClicked({
                    event: e,
                    value: value,
                    itemType,
                  });
              }}
              onClick={(e) => {
                e.stopPropagation();
                onTreeItemClicked &&
                  onTreeItemClicked({
                    event: e,
                    value: value,
                    itemType,
                  });
              }}
              itemType={itemType}
              value={value}
            >
              <TreeItemLayout
                className={mergeClasses(
                  styles.itemLayout,
                  selection.some((s) => s.value === value)
                    ? styles.itemSelected
                    : undefined
                )}
                main={{ style: { width: '100%' } }}
              >
                {renameTarget === value ? (
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
                ) : (
                  <Text
                    wrap={false}
                    truncate={true}
                    className={styles.itemText}
                  >
                    {document.name}
                  </Text>
                )}
              </TreeItemLayout>
              {document.type === 'folder' && (
                <FolderTree
                  onAddNewFolder={onAddNewFolder}
                  onTreeItemClicked={onTreeItemClicked}
                  selection={selection}
                  spaceKey={spaceKey}
                  path={document.path}
                  level={level + 1}
                  openItems={openItems}
                  addNewFolderTarget={addNewFolderTarget}
                  renameTarget={renameTarget}
                  onRename={onRename}
                />
              )}
            </TreeItem>
          </MenuTrigger>
        );
      })}
    </Tree>
  );
};
