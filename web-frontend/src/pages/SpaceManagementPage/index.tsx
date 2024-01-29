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

interface Space {
  id: string;
  name: string;
  path: string;
}

// Placeholder functions for server interactions
const createNewSpace = async (
  name: string,
  location: string
): Promise<Space> => {
  // Implement actual server POST request to create a new space here
  // Return the newly created space object
  return {
    id: Math.random().toString(36).substring(2, 9),
    name,
    path: location,
  };
};

const openExistingSpace = async (space: Space): Promise<void> => {
  // Implement actual server logic to open an existing space here
};

const importFolderAsSpace = async (folderPath: string): Promise<Space> => {
  // Implement actual server POST request to import a folder as a space here
  // Return the newly created/imported space object
  return {
    id: Math.random().toString(36).substring(2, 9),
    name: 'Imported Folder',
    path: folderPath,
  };
};

const SpaceManagementPage: React.FunctionComponent = () => {
  const [recentSpaces, setRecentSpaces] = useState<Space[]>([]); // Load from preferences or server
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

  const { mutate: createNewSpace } = useMutation({
    mutationKey: ['createNewSpace'],
    mutationFn: async () => {
      if (!selectedDirectory) {
        throw new Error('No directory selected');
      }
      const newSpace = await spacesApi.spacesPost({
        space: {
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
      <h1>Space Management</h1>
      <div>
        <h2>Recent Spaces</h2>
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

export default SpaceManagementPage;
