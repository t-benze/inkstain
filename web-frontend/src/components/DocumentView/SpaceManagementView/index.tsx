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
  Toast,
  useId,
  useToastController,
  ToastTitle,
  ToastBody,
  ProgressBar,
  Spinner,
  makeStyles,
  Title2,
  Body2,
  tokens,
  shorthands,
  Tooltip,
} from '@fluentui/react-components';
import { DialogOpenChangeEventHandler } from '@fluentui/react-dialog';
import { FormNewRegular, FolderOpenRegular } from '@fluentui/react-icons';
import { DirectoryPickerDialog } from '~/web/components/DirectoryPickerDialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { spacesApi, taskApi } from '~/web/apiClient';
import { AppContext } from '~/web/app/context';
import { useTranslation } from 'react-i18next';

const useClasses = makeStyles({
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
    '& .fui-Button': {
      textWrap: 'nowrap',
      overflowX: 'hidden',
      textOverflow: 'ellipsis',
      marginRight: tokens.spacingHorizontalM,
      flexShrink: 0,
    },
    '& .fui-Text': {
      color: tokens.colorNeutralForeground4,
      textWrap: 'nowrap',
      textOverflow: 'ellipsis',
      overflowX: 'hidden',
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
        <DialogTitle>{t('space.input_space_name')}</DialogTitle>
        <DialogBody>
          <Input
            data-test="createSpace-nameInput"
            value={spaceName}
            onChange={(_, data) => onSpaceNameChange(data.value)}
          />
        </DialogBody>
        <DialogActions>
          <DialogTrigger>
            <Button appearance="secondary">{t('cancel')}</Button>
          </DialogTrigger>
          <Button
            data-test="createSpace-confirmBtn"
            appearance="primary"
            onClick={onConfirm}
          >
            {t('confirm')}
          </Button>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
};

const CreateSpaceProgress = ({
  taskId,
  onFinish,
}: {
  taskId: string;
  onFinish: () => void;
}) => {
  const { data } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      return await taskApi.getTaskStatus({ id: taskId });
    },
  });
  const queryClient = useQueryClient();
  const progress = data?.progress ?? 0;
  useEffect(() => {
    if (progress < 100) {
      const timeout = setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['task', taskId],
        });
      }, 500);
      return () => clearTimeout(timeout);
    } else {
      onFinish();
    }
  }, [progress, queryClient, taskId, onFinish]);

  return <ProgressBar value={progress} max={100} />;
};

export const SpaceManagementView = () => {
  const classes = useClasses();
  const { t } = useTranslation();
  const [openDirectoryDialog, setOpenDirectoryDialog] = useState(false);
  const [openSpaceNameDialog, setOpenSpaceNameDialog] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [selectedDirectory, setSelectedDirectory] = useState<string | null>(
    null
  );
  const [isCreatingNewSpace, setIsCreatingNewSpace] = useState(false);

  const appContext = useContext(AppContext);
  const toastId = useId('toast');

  const { dispatchToast, updateToast } = useToastController(
    appContext.toasterId
  );
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
      const result = await spacesApi.createSpace({
        type: 'new',
        createSpaceRequest: {
          name: newSpaceName,
          path: selectedDirectory + appContext.platform.pathSep + newSpaceName,
        },
      });
      return result;
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
    onSuccess: async (data) => {
      if (data.taskId) {
        updateToast({
          content: (
            <Toast>
              <ToastTitle>{t('space.creating_space')}</ToastTitle>
              <ToastBody>
                <CreateSpaceProgress
                  taskId={data.taskId}
                  onFinish={() => {
                    updateToast({
                      content: (
                        <Toast>
                          <ToastTitle>
                            {t('space.create_space_success')}
                          </ToastTitle>
                        </Toast>
                      ),
                      intent: 'success',
                      timeout: 1000,
                      toastId,
                    });
                    queryClient.invalidateQueries({
                      queryKey: ['spaces'],
                    });
                  }}
                />
              </ToastBody>
            </Toast>
          ),
          intent: 'info',
          timeout: -1,
          toastId,
        });
      } else {
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
      }
    },
    onError: (error) => {
      console.log('on error', error);
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
    <div className={classes.root}>
      <Title2>{t('space.start')}</Title2>
      <div className={classes.start}>
        <Button
          data-test="createSpaceBtn"
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
          data-test="openFolderBtn"
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
      <Title2>{t('space.open_space')}</Title2>
      <div className={classes.recent}></div>
      {isSpacesLoading ? (
        <div>{t('loading')}</div>
      ) : spaces && spaces.length > 0 ? (
        spaces.map((space) => {
          return (
            <div key={space.key} className={classes.recentSpace}>
              <Button
                data-test={`recentSpaceBtn-${space.key}`}
                appearance="transparent"
                size="large"
                onClick={() => {
                  window.location.href = `${window.location.origin}?space=${space.key}`;
                }}
              >
                {space.name}
              </Button>
              <Tooltip relationship="description" content={space.path}>
                <Body2>{space.path}</Body2>
              </Tooltip>
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
