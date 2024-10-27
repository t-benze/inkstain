import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { tokens, makeStyles, Body2 } from '@fluentui/react-components';
import { FolderRegular, DocumentRegular } from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import { documentsApi } from '~/chrome-extension/utils/apiClient';
import { ListDocuments200ResponseInner as Document } from '@inkstain/client-api';
import { PopupContext } from '~/chrome-extension/components/SpacePopup/context';

interface FolderTreeProps {
  spaceKey: string;
  currentFolder: Array<string>;
  onFolderSelected?: (folder: string[]) => void;
}

const useClasses = makeStyles({
  root: {
    flexGrow: 1,
    height: '0px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  breadcrumb: {
    padding: tokens.spacingHorizontalM,
  },
  breadcrumbItem: {
    display: 'inline-block',
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  list: {
    flexGrow: 1,
    height: '0px',
    width: '100%',
    overflow: 'scroll',
    scrollbarWidth: 'none',
    // padding: tokens.spacingVerticalMNudge,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  listItem: {
    fontSize: tokens.fontSizeBase400,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    paddingLeft: tokens.spacingHorizontalMNudge,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
    '& > svg': {
      marginRight: tokens.spacingHorizontalMNudge,
      width: '16px',
      height: '16px',
    },
    '& > span': {
      display: 'inline-block',
      width: '0px',
      flexGrow: 1,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
});

const FileItem = ({
  file,
  isFolder,
  onFolderSelected,
}: {
  onFolderSelected?: (folder: string) => void;
  isFolder: boolean;
  file: Document;
}) => {
  const classes = useClasses();
  return (
    <div
      className={classes.listItem}
      onClick={() => {
        onFolderSelected && onFolderSelected(file.name);
      }}
    >
      {isFolder ? <FolderRegular /> : <DocumentRegular />}
      <span>{file.name}</span>
    </div>
  );
};

export const FolderExplorer = ({
  spaceKey,
  currentFolder,
  onFolderSelected,
}: FolderTreeProps) => {
  const classes = useClasses();
  const { t } = useTranslation();
  const {
    platformInfo: { pathSep },
  } = React.useContext(PopupContext);
  const { data } = useQuery({
    queryKey: ['folders', spaceKey, currentFolder.join(pathSep)],
    queryFn: async () => {
      const path = currentFolder.slice(1).join(pathSep);
      const response = await documentsApi.listDocuments({
        spaceKey,
        path: path,
      });
      return response;
    },
  });
  return (
    <div className={classes.root}>
      <div className={classes.breadcrumb}>
        <Body2>
          {currentFolder.map((folder, index) => (
            <>
              <span
                key={index}
                className={classes.breadcrumbItem}
                onClick={() => {
                  onFolderSelected &&
                    onFolderSelected([...currentFolder.slice(0, index)]);
                }}
              >
                {folder === '' ? t('root_folder') : folder}
              </span>
              {index < currentFolder.length - 1 && <span>{` > `}</span>}
            </>
          ))}
        </Body2>
      </div>
      {data ? (
        <div className={classes.list}>
          {data
            .filter((doc) => doc.type === 'folder')
            .map((doc) => (
              <FileItem
                key={doc.name}
                file={doc}
                isFolder={true}
                onFolderSelected={() => {
                  onFolderSelected &&
                    onFolderSelected([...currentFolder, doc.name]);
                }}
              />
            ))}
          {data
            .filter((doc) => doc.type === 'file')
            .map((doc) => (
              <FileItem key={doc.name} file={doc} isFolder={false} />
            ))}
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};
