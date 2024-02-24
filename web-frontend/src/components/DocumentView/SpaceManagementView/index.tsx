import { useState, useEffect, useContext } from 'react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogActions,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Input,
  Field,
  Toaster,
  Toast,
  useId,
  useToastController,
  ToastTitle,
  Spinner,
  makeStyles,
  Title2,
  Body2,
  tokens,
  shorthands,
} from '@fluentui/react-components';
import { DialogOpenChangeEventHandler } from '@fluentui/react-dialog';
import { FormNewRegular, FolderOpenRegular } from '@fluentui/react-icons';
import { DirectoryPickerDialog } from '~/web/components/DirectoryPickerDialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { spacesApi } from '~/web/apiClient';
import { AppContext } from '~/web/app/context';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    ...shorthands.padding(
      tokens.spacingVerticalXXXL,
      tokens.spacingHorizontalL
    ),
  },
  icon: {
    width: '24px',
    height: '24px',
  },
  start: {
    paddingTop: tokens.spacingVerticalM,
    '> button': {
      display: 'block',
      // marginBottom: tokens.spacingVerticalS,
    },
  },
  recent: {
    paddingTop: tokens.spacingVerticalM,
  },
  recentSpace: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: tokens.spacingVerticalS,
    '> button': {
      marginRight: tokens.spacingHorizontalM,
    },
    '> span': {
      color: tokens.colorNeutralForeground4,
    },
  },
});

const SpaceNameDialog = ({
  open,
  onOpenChange,
  onSpaceNameChange,
  spaceName,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: DialogOpenChangeEventHandler;
  onSpaceNameChange: (name: string) => void;
  spaceName: string;
  onConfirm: () => void;
}) => {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogSurface>
        <DialogTitle>{t('space.input_spance_name')}</DialogTitle>
        <DialogBody>
          <Field label={t('space.name')}>
            <Input
              value={spaceName}
              onChange={(_, data) => onSpaceNameChange(data.value)}
            />
          </Field>
        </DialogBody>
        <DialogActions>
          <DialogTrigger>
            <Button appearance="secondary">{t('cancel')}</Button>
          </DialogTrigger>
          <Button appearance="primary" onClick={onConfirm}>
            {t('confirm')}
          </Button>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
};
export const SpaceManagementView = () => {
  const styles = useStyles();
  const { t } = useTranslation();
  const [openDirectoryDialog, setOpenDirectoryDialog] = useState(false);
  const [openSpaceNameDialog, setOpenSpaceNameDialog] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [selectedDirectory, setSelectedDirectory] = useState<string | null>(
    null
  );
  const [isCreatingNewSpace, setIsCreatingNewSpace] = useState(false);

  const appContext = useContext(AppContext);
  const toasterId = useId('toaster');
  const toastId = useId('toast');

  const { dispatchToast, updateToast } = useToastController(toasterId);
  const queryClient = useQueryClient();

  useEffect(() => {
    setSelectedDirectory(appContext.platform.homedir);
  }, [appContext.platform]);

  useEffect(() => {
    setSelectedDirectory(appContext.platform.homedir);
  }, [appContext.platform]);

  const { data: spaces, isLoading: isSpacesLoading } = useQuery({
    queryKey: ['spaces'],
    queryFn: async () => {
      return await spacesApi.getSpaces();
    },
  });

  const { mutate: createNewSpace } = useMutation({
    mutationKey: ['createNewSpace'],
    mutationFn: async (type: string) => {
      if (!selectedDirectory) {
        throw new Error('No directory selected');
      }
      if (type === 'inkstain') {
        return await spacesApi.createSpace({
          type: type,
          createSpaceRequest: {
            path:
              selectedDirectory + appContext.platform.pathSep + newSpaceName,
          },
        });
      }
      if (!newSpaceName || newSpaceName.length === 0) {
        throw new Error('No space name');
      }
      return await spacesApi.createSpace({
        type: 'new',
        createSpaceRequest: {
          name: newSpaceName,
          path: selectedDirectory + appContext.platform.pathSep + newSpaceName,
        },
      });
    },
    onMutate: () => {
      dispatchToast(
        <Toast>
          <ToastTitle media={<Spinner size="tiny" />}>
            {t('space.creating_space')}
          </ToastTitle>
        </Toast>,
        {
          position: 'top',
          intent: 'info',
          timeout: -1,
          toastId,
        }
      );
    },
    onSuccess: () => {
      updateToast({
        content: (
          <Toast>
            <ToastTitle>{t('space.create_space_success')}</ToastTitle>
          </Toast>
        ),
        intent: 'success',
        timeout: 2000,
        toastId,
      });
      queryClient.invalidateQueries({
        queryKey: ['spaces'],
      });
    },
    onError: () => {
      updateToast({
        content: (
          <Toast>
            <ToastTitle>{t('space.create_space_fail')}</ToastTitle>
          </Toast>
        ),
        intent: 'error',
        timeout: 2000,
        toastId,
      });
    },
  });

  return (
    <div className={styles.root}>
      <Toaster toasterId={toasterId} />
      <Title2>{t('space.start')}</Title2>
      <div className={styles.start}>
        <Button
          appearance="transparent"
          size="large"
          icon={<FormNewRegular />}
          onClick={() => {
            setIsCreatingNewSpace(true);
            setOpenDirectoryDialog(true);
          }}
        >
          {t('space.create_space')}
        </Button>
        <Button
          appearance="transparent"
          size="large"
          icon={<FolderOpenRegular />}
          onClick={() => {
            setIsCreatingNewSpace(false);
            setOpenDirectoryDialog(true);
          }}
        >
          {t('space.open_folder')}
        </Button>
      </div>
      <Title2>{t('space.recent')}</Title2>
      <div className={styles.recent}></div>
      {isSpacesLoading ? (
        <div>{t('loading')}</div>
      ) : spaces && spaces.length > 0 ? (
        spaces.map((space) => {
          return (
            <div key={space.key} className={styles.recentSpace}>
              <Button
                appearance="transparent"
                size="large"
                onClick={() => appContext.openSpace(space)}
              >
                {space.name}
              </Button>
              <Body2>{space.path}</Body2>
            </div>
          );
        })
      ) : (
        <div>{t('space.no_recent_spaces')}</div>
      )}
      <DirectoryPickerDialog
        currentDirectory={selectedDirectory || ''}
        onSelectDirectory={(path) => {
          setSelectedDirectory(path);
          if (isCreatingNewSpace) {
            setOpenSpaceNameDialog(true);
          } else {
            createNewSpace('inkstain');
            // open a directory as space
            console.log(' open directroy as space', path);
          }
        }}
        onOpenChange={(_, data) => {
          setOpenDirectoryDialog(data.open);
        }}
        open={openDirectoryDialog}
        confirmText={isCreatingNewSpace ? t('next') : t('confirm')}
      />
      <SpaceNameDialog
        open={openSpaceNameDialog}
        onOpenChange={(_, data) => {
          setOpenSpaceNameDialog(data.open);
        }}
        onSpaceNameChange={setNewSpaceName}
        spaceName={newSpaceName}
        onConfirm={() => {
          setOpenSpaceNameDialog(false);
          createNewSpace('new');
        }}
      />
    </div>
  );
};
