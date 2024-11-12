import { MenuPopover, MenuList, MenuItem } from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
export const ContextMenu = ({
  lastSelect,
  deleteFiles,
  exportFile,
  rename,
}: {
  lastSelect: {
    value: string;
    itemType: string;
  } | null;
  deleteFiles: () => void;
  exportFile: (withData: boolean) => void;
  rename: () => void;
}) => {
  const { t } = useTranslation();
  const enableExport = lastSelect && lastSelect?.itemType === 'leaf';
  return (
    <MenuPopover>
      <MenuList>
        <MenuItem data-test="fileExplorer-contextDelete" onClick={deleteFiles}>
          {t('delete')}
        </MenuItem>
        <MenuItem data-test="fileExplorer-contextRename" onClick={rename}>
          {t('rename')}
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
