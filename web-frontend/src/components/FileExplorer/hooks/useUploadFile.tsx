import * as React from 'react';
import {
  useId,
  useToastController,
  Toast,
  ToastBody,
  ToastTitle,
  ProgressBar,
} from '@fluentui/react-components';
import { useAppContext } from '~/web/app/hooks/useAppContext';
import { getFolderPath } from '../utils';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';

export const useUploadFile = (
  spaceKey: string,
  lastSelect: { value: string; itemType: string } | null
) => {
  const appContext = useAppContext();
  const toastId = useId('toast');
  const { dispatchToast, updateToast } = useToastController(
    appContext.toasterId
  );
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const handleFileInputChange = React.useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) throw new Error('No file selected');
      const formData = new FormData();
      formData.append('document', file);
      const folder = lastSelect
        ? getFolderPath(lastSelect, appContext.platform.pathSep)
        : '';
      const path =
        folder === ''
          ? file.name
          : `${folder}${appContext.platform.pathSep}${file.name}`;
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `/api/v1/documents/${spaceKey}/add?path=${path}`, true);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          updateToast({
            toastId,
            content: (
              <Toast>
                <ToastTitle>{t('file_explorer.adding_document')}</ToastTitle>
                <ToastBody>
                  <ProgressBar max={100} value={percentComplete} />
                </ToastBody>
              </Toast>
            ),
          });
        }
      };
      xhr.onload = () => {
        if (xhr.status === 201) {
          updateToast({
            toastId,
            content: (
              <Toast>
                <ToastTitle>{t('file_explorer.adding_document')}</ToastTitle>
                <ToastBody>
                  {t('file_explorer.adding_document_succeeded')}
                </ToastBody>
              </Toast>
            ),
            timeout: 500,
            intent: 'success',
          });
          queryClient.invalidateQueries({
            queryKey: ['documents', spaceKey, folder],
          });
          queryClient.invalidateQueries({
            queryKey: ['searchDocuments', spaceKey, '', '', 0],
          });
        } else {
          console.error('Adding document failed at uploading');
          updateToast({
            toastId,
            intent: 'error',
            content: (
              <Toast>
                <ToastTitle>{t('file_explorer.adding_document')}</ToastTitle>
                <ToastBody>
                  {t('file_explorer.adding_document_failed')}
                </ToastBody>
              </Toast>
            ),
            timeout: 500,
          });
        }
      };
      xhr.onerror = (e) => {
        console.error('Adding document failed', e);
        updateToast({
          toastId,
          intent: 'error',
          content: (
            <Toast>
              <ToastTitle>{t('file_explorer.adding_document')}</ToastTitle>
              <ToastBody>{t('file_explorer.adding_document_failed')}</ToastBody>
            </Toast>
          ),
          timeout: 500,
        });
      };
      xhr.send(formData);
      dispatchToast(
        <Toast>
          <ToastTitle>{t('file_explorer.adding_document')}</ToastTitle>
          <ToastBody>
            <ProgressBar max={100} value={0} />
          </ToastBody>
        </Toast>,
        {
          intent: 'info',
          position: 'top',
          timeout: -1,
          toastId,
        }
      );
    },
    [
      spaceKey,
      updateToast,
      lastSelect,
      appContext.platform.pathSep,
      dispatchToast,
      toastId,
      t,
      queryClient,
    ]
  );
  return {
    handleFileInputChange,
  };
};
