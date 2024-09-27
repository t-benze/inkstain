import * as React from 'react';
import {
  useId,
  useToastController,
  Toast,
  ToastTitle,
  ToastBody,
  ProgressBar,
} from '@fluentui/react-components';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '~/web/apiClient';
import { useAppContext } from '~/web/app/hooks/useAppContext';

const TaskProgressToast = ({
  taskId,
  onSuccess,
  onFailure,
}: {
  taskId: string;
  onSuccess: () => void;
  onFailure: () => void;
}) => {
  const { data } = useQuery({
    queryKey: ['taskStatus', taskId],
    queryFn: async () => {
      const data = await taskApi.getTaskStatus({ id: taskId });
      return data;
    },
    refetchInterval: (query) => {
      if (
        !query.state.data ||
        query.state.data?.status === 'running' ||
        query.state.data?.status === 'pending'
      ) {
        return 800;
      }
      return false;
    },
  });
  React.useEffect(() => {
    if (data?.status === 'completed') {
      onSuccess();
    } else if (data?.status === 'failed') {
      onFailure();
    }
  }, [data, onSuccess, onFailure]);

  return <ProgressBar value={data?.progress ?? 0} max={100} />;
};

export const useTaskProgressToast = () => {
  const appContext = useAppContext();
  const toasterId = appContext.toasterId;
  const toastId = useId('toast');
  const { dispatchToast, updateToast } = useToastController(toasterId);

  const showToast = React.useCallback(
    ({
      taskId,
      taskTitle,
      taskSuccessMessage,
      taskFailureMessage,
      onSuccess,
      onFailure,
    }: {
      taskId: string;
      taskTitle: string;
      taskSuccessMessage: string;
      taskFailureMessage: string;
      onSuccess?: () => void;
      onFailure?: () => void;
    }) => {
      dispatchToast(
        <Toast>
          <ToastTitle>{taskTitle}</ToastTitle>
          <ToastBody>
            <TaskProgressToast
              taskId={taskId}
              onSuccess={() => {
                updateToast({
                  content: (
                    <Toast>
                      <ToastTitle>{taskSuccessMessage}</ToastTitle>
                    </Toast>
                  ),
                  intent: 'success',
                  timeout: 1000,
                  toastId,
                });
                onSuccess?.();
              }}
              onFailure={() => {
                updateToast({
                  content: (
                    <Toast>
                      <ToastTitle>{taskFailureMessage}</ToastTitle>
                    </Toast>
                  ),
                  intent: 'error',
                  timeout: 1000,
                  toastId,
                });
                onFailure?.();
              }}
            />
          </ToastBody>
        </Toast>,
        {
          position: 'top',
          intent: 'info',
          timeout: -1,
          toastId,
        }
      );
    },
    [dispatchToast, toastId, updateToast]
  );
  return showToast;
};
