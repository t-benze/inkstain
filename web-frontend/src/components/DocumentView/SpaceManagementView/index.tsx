import { useState, useEffect, useContext, useCallback } from 'react';
import {
  Button,
  Dialog,
  DialogTrigger,
  Input,
  Field,
  Toaster,
  Toast,
  useId,
  useToastController,
  ToastTitle,
  Spinner,
  ToastBody,
  ToastFooter,
} from '@fluentui/react-components';
import { DirectoryPickerDialog } from '~/web/components/DirectoryPickerDialog';
import { useQuery, useMutation } from '@tanstack/react-query';
import { platformApi, spacesApi } from '~/web/apiClient';
import { AppContext } from '~/web/app/context';

export const SpaceManagementView: React.FunctionComponent = () => {
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

  const {
    data: spaces,
    isLoading: isSpacesLoading,
    refetch: refetchSpaces,
  } = useQuery({
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
          data: {
            path:
              selectedDirectory + appContext.platform.pathSep + newSpaceName,
          },
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
      <h1>Space Management</h1>
      <div>
        <h2>Spaces</h2>
        {isSpacesLoading ? (
          <div>loading...</div>
        ) : (
          <ul>
            {spaces ? (
              Object.keys(spaces)?.map((spaceName) => {
                const space = spaces[spaceName];
                return (
                  <li key={spaceName}>
                    <Button
                      onClick={() =>
                        appContext.openSpace(spaceName, space.path)
                      }
                    >
                      {spaceName}
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
