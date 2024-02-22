import { useState, useEffect, useContext } from 'react';
import {
  Button,
  Input,
  Field,
  Toaster,
  Toast,
  useId,
  useToastController,
  ToastTitle,
  Spinner,
} from '@fluentui/react-components';
import { DirectoryPickerDialog } from '~/web/components/DirectoryPickerDialog';
import { useQuery, useMutation } from '@tanstack/react-query';
import { spacesApi } from '~/web/apiClient';
import { AppContext } from '~/web/app/context';
import { useTranslation } from 'react-i18next';

export const SpaceManagementView: React.FunctionComponent = () => {
  const { t } = useTranslation();
  const [newSpaceName, setNewSpaceName] = useState('');
  const [selectedDirectory, setSelectedDirectory] = useState<string | null>(
    null
  );

  const appContext = useContext(AppContext);
  const toasterId = useId('toaster');
  const toastId = useId('toast');

  const { dispatchToast, updateToast } = useToastController(toasterId);

  useEffect(() => {
    setSelectedDirectory(appContext.platform.homedir);
  }, [appContext.platform]);

  useEffect(() => {
    setSelectedDirectory(appContext.platform.homedir);
  }, [appContext.platform]);

  const { data: spaces, isLoading: isSpacesLoading } = useQuery({
    queryKey: ['spaces'],
    queryFn: async () => {
      return await spacesApi.spacesGet();
    },
  });

  const { mutate: createNewSpace } = useMutation({
    mutationKey: ['createNewSpace'],
    mutationFn: async () => {
      if (!selectedDirectory) {
        throw new Error('No directory selected');
      }
      const newSpace = await spacesApi.spacesPost({
        spacesPostRequest: {
          name: newSpaceName,
          path: selectedDirectory + appContext.platform.pathSep + newSpaceName,
        },
      });
      return newSpace;
    },
    onMutate: () => {
      dispatchToast(
        <Toast>
          <ToastTitle media={<Spinner size="tiny" />}>
            Creating space
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
            <ToastTitle>Successfully created space</ToastTitle>
          </Toast>
        ),
        intent: 'success',
        timeout: 2000,
        toastId,
      });
    },
    onError: () => {
      updateToast({
        content: (
          <Toast>
            <ToastTitle>Failed to create space</ToastTitle>
          </Toast>
        ),
        intent: 'error',
        timeout: 2000,
        toastId,
      });
    },
  });

  const handleSelectDirectory = (path: string) => {
    setSelectedDirectory(path);
  };

  return (
    <>
      <Toaster toasterId={toasterId} />
      <h1>{t('space.space_management')}</h1>
      <div>
        <h2>Spaces</h2>
        {isSpacesLoading ? (
          <div>loading...</div>
        ) : (
          <ul>
            {spaces ? (
              spaces.map((space) => {
                // const space = spaces[spaceName];
                return (
                  <li key={space.key}>
                    <Button onClick={() => appContext.openSpace(space)}>
                      {space.name}
                    </Button>
                  </li>
                );
              })
            ) : (
              <div>No spaces found</div>
            )}
          </ul>
        )}
      </div>
      <div>
        <h2>Create New Space</h2>
        <Field label="Space Name" required>
          <Input
            value={newSpaceName}
            onChange={(_, e) => setNewSpaceName(e.value || '')}
          />
        </Field>
        <Field label="Location" required>
          <Input value={selectedDirectory || ''} disabled />
        </Field>
        <DirectoryPickerDialog
          triggerButtonText="Select Folder"
          currentDirectory={selectedDirectory || ''}
          onSelectDirectory={handleSelectDirectory}
        />
        <Button onClick={() => createNewSpace()}>Create Space</Button>
      </div>
      <div>
        <h2>Open Space</h2>
      </div>
      <div>
        <h2>Import Folder as Space</h2>
      </div>
    </>
  );
};
