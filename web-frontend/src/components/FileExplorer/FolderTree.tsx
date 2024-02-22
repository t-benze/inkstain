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
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
} from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
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
  selection: Set<TreeItemValue>;
  onTreeItemClicked?: OnTreeItemClicked;
  addNewFolderTarget: string | null;
  addFolder: (params: { targetFolder: string; name: string }) => void;
  deleteFiles: () => void;
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
  addNewFolderTarget,
  addFolder,
  deleteFiles,
}: FolderTreeProps) => {
  const styles = useStyles();
  const { t } = useTranslation();
  const appContext = React.useContext(AppContext);
  const currentFolder = path.endsWith(appContext.platform.pathSep)
    ? path.slice(0, -appContext.platform.pathSep.length)
    : path;
  const { data, isLoading } = useQuery({
    queryKey: ['documents', spaceKey, currentFolder],
    queryFn: async () => {
      return await documentsApi.documentsSpaceKeyListGet({
        spaceKey: spaceKey,
        path,
      });
    },
    enabled: level === 0 || Boolean(openItems?.has(path)),
  });
  const [newFolderName, setNewFolderName] = React.useState<string>('');
  const newFolderInputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (newFolderInputRef.current) {
      newFolderInputRef.current.focus();
    }
  }, [addNewFolderTarget]);

  return isLoading ? (
    <Spinner></Spinner>
  ) : (
    <Tree
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
              size="small"
              ref={newFolderInputRef}
              value={newFolderName}
              onChange={(e, data) => {
                setNewFolderName(data.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addFolder({
                    targetFolder: currentFolder,
                    name: newFolderName,
                  });
                  setNewFolderName('');
                }
              }}
              onBlur={() => {
                addFolder({ targetFolder: currentFolder, name: newFolderName });
                setNewFolderName('');
              }}
            />
          </TreeItemLayout>
        </TreeItem>
      ) : null}
      {data?.map((document) => (
        <Menu openOnContext positioning="below-end">
          <MenuTrigger disableButtonEnhancement>
            <TreeItem
              onContextMenu={(e) => {
                e.stopPropagation();
                onTreeItemClicked &&
                  onTreeItemClicked({
                    event: e,
                    value: document.path,
                    itemType: document.type === 'folder' ? 'branch' : 'leaf',
                  });
              }}
              onClick={(e) => {
                e.stopPropagation();
                onTreeItemClicked &&
                  onTreeItemClicked({
                    event: e,
                    value: document.path,
                    itemType: document.type === 'folder' ? 'branch' : 'leaf',
                  });
              }}
              key={document.path}
              itemType={document.type === 'folder' ? 'branch' : 'leaf'}
              value={
                document.path +
                (document.type === 'folder' ? appContext.platform.pathSep : '')
              }
            >
              <TreeItemLayout
                className={mergeClasses(
                  styles.itemLayout,
                  selection.has(document.path) ? styles.itemSelected : undefined
                )}
                main={{ style: { width: '100%' } }}
              >
                <Text wrap={false} truncate={true} className={styles.itemText}>
                  {document.name}
                </Text>
              </TreeItemLayout>
              {document.type === 'folder' && (
                <FolderTree
                  addFolder={addFolder}
                  onTreeItemClicked={onTreeItemClicked}
                  selection={selection}
                  spaceKey={spaceKey}
                  path={document.path + appContext.platform.pathSep}
                  level={level + 1}
                  openItems={openItems}
                  addNewFolderTarget={addNewFolderTarget}
                  deleteFiles={deleteFiles}
                />
              )}
            </TreeItem>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItem onClick={deleteFiles}>{t('delete')}</MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>
      ))}
    </Tree>
  );
};
