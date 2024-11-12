import * as React from 'react';
import { Select } from '../types';
import { documentsApi } from '~/web/apiClient';

export const useExport = (spaceKey: string, lastSelect: Select | null) => {
  const exportFile = React.useCallback(
    async (withData: boolean) => {
      if (lastSelect) {
        try {
          console.log('export file', lastSelect.value);
          const response = await documentsApi.exportDocumentRaw({
            spaceKey: spaceKey,
            path: lastSelect.value,
            withData: withData ? '1' : '0',
          });

          if (!response.raw.ok) {
            throw new Error('Export failed');
          }
          // Get the filename from the Content-Disposition header
          const contentDisposition = response.raw.headers.get(
            'Content-Disposition'
          );
          const filenameMatch =
            contentDisposition &&
            contentDisposition.match(/filename="?(.+)"?/i);
          const filename = filenameMatch
            ? filenameMatch[1]
            : 'exported-document';

          // Create a Blob from the response
          const blob = await response.raw.blob();

          // Create a temporary URL for the Blob
          const url = window.URL.createObjectURL(blob);

          // Create a temporary anchor element and trigger the download
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();

          // Clean up
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } catch (error) {
          console.error('Error exporting document:', error);
          // Handle the error (e.g., show an error message to the user)
        }
      }
    },
    [lastSelect, spaceKey]
  );
  return {
    exportFile,
  };
};
