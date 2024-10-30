import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { systemApi } from '~/web/apiClient';
import { Settings } from '@inkstain/client-api';

export const useSettings = () => {
  const queryClient = useQueryClient();
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      return await systemApi.getSettings();
    },
  });
  const { mutate: updateSettings } = useMutation({
    mutationFn: async (settings: Settings) => {
      return await systemApi.updateSettings({ settings });
    },
    onMutate: async (newSettings) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['settings'],
      });
      // Snapshot the previous value
      const previousSettings = queryClient.getQueryData([
        'settings',
      ]) as Settings;
      // Optimistically update to the new value
      queryClient.setQueryData(['settings'], {
        ...previousSettings,
        ...newSettings,
      });
      // Return a context object with the snapshotted value
      return { previousSettings };
    },
    onError: (err, newSettings, context) => {
      // On error, roll back to the previous value
      queryClient.setQueryData(['settings'], context?.previousSettings);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: ['settings'],
      });
    },
  });
  return { settings, updateSettings };
};
