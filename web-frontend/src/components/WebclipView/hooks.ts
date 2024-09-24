import * as React from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { DocumentViewContext } from '~/web/components/DocumentView/context';
import { intelligenceApi } from '~/web/apiClient';
import { taskApi } from '~/web/apiClient';

export const useWebclipLayoutTask = () => {
  const { space, document } = React.useContext(DocumentViewContext);
  const [taskId, setTaskId] = React.useState<string | null>(null);
  const queryClient = useQueryClient();
  const startLayoutTask = async () => {
    const { taskId } = await intelligenceApi.intelligenceWebclipDocument({
      spaceKey: space.key,
      intelligenceAnalyzeDocumentRequest: {
        documentPath: document.name,
      },
    });
    setTaskId(taskId);
  };
  const { data: taskStatus } = useQuery({
    queryKey: ['taskStatus', taskId],
    queryFn: async () => {
      if (!taskId) {
        return null;
      }
      const task = await taskApi.getTaskStatus({ id: taskId });
      return task;
    },
  });
  React.useEffect(() => {
    if (taskId) {
      if (
        !taskStatus ||
        taskStatus.status === 'pending' ||
        taskStatus.status === 'running'
      ) {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['taskStatus', taskId] });
        }, 1000);
      }
    }
  }, [taskId, queryClient, taskStatus]);

  const { data: docLayoutStatus } = useQuery({
    queryKey: ['document-layout-status', space.key, document.name],
    queryFn: async () => {
      const status = await intelligenceApi.intelligenceDocLayoutStatus({
        spaceKey: space.key,
        path: document.name,
      });
      return status;
    },
  });

  React.useEffect(() => {
    if (docLayoutStatus?.status === 'completed') {
      queryClient.invalidateQueries({
        queryKey: ['document-layout', space.key, document.name],
      });
    }
  }, [docLayoutStatus, queryClient, space.key, document.name]);

  return { docLayoutStatus, startLayoutTask, taskStatus };
};
