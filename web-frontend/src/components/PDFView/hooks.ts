import * as React from 'react';
import { PDFDocumentProxy, PDFDocumentLoadingTask } from 'pdfjs-dist';
import * as pdfjsLib from 'pdfjs-dist';
import { DocumentViewContext } from '~/web/components/DocumentView/context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { intelligenceApi, taskApi } from '~/web/apiClient';

export const usePDFDocument = ({
  url,
  onDocumentLoadSuccess,
  onDocumentLoadFailure,
}: {
  url: string;
  onDocumentLoadSuccess?: (document: PDFDocumentProxy) => void;
  onDocumentLoadFailure?: (error: Error) => void;
}) => {
  const [pdfDocument, setPDFDocument] = React.useState<PDFDocumentProxy | null>(
    null
  );
  const loadingTaskRef = React.useRef<PDFDocumentLoadingTask | null>(null);
  React.useEffect(() => {
    if (!loadingTaskRef.current) {
      loadingTaskRef.current = pdfjsLib.getDocument(url);
    }
    loadingTaskRef.current.promise
      .then((loadedPdfDocument) => {
        setPDFDocument(loadedPdfDocument);
        onDocumentLoadSuccess?.(loadedPdfDocument);
      })
      .catch((error: Error) => {
        onDocumentLoadFailure?.(error);
      })
      .finally(() => {
        loadingTaskRef.current = null;
      });
  }, [
    url,
    // pdfDocument,
    loadingTaskRef,
    onDocumentLoadFailure,
    onDocumentLoadSuccess,
  ]);
  return pdfDocument;
};

export const usePDFLayoutTask = () => {
  const { space, document } = React.useContext(DocumentViewContext);
  const [taskId, setTaskId] = React.useState<string | null>(null);
  const queryClient = useQueryClient();
  const startLayoutTask = async () => {
    const { taskId } = await intelligenceApi.intelligenceAnalyzeDocument({
      spaceKey: space.key,
      intelligenceAnalyzeDocumentRequest: {
        documentPath: document.name,
      },
    });
    setTaskId(taskId);
  };

  const { data: taskStatus } = useQuery({
    queryKey: ['taskStatus', taskId],
    refetchInterval: (query) => {
      if (
        !query.state.data ||
        query.state.data.status === 'pending' ||
        query.state.data.status === 'running'
      ) {
        return 2000;
      }
      return false;
    },
    queryFn: async () => {
      if (!taskId) {
        return null;
      }
      const task = await taskApi.getTaskStatus({ id: taskId });
      return task;
    },
  });

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
    if (taskStatus?.status === 'completed') {
      queryClient.invalidateQueries({
        queryKey: ['document-layout', space.key, document.name],
      });
      queryClient.invalidateQueries({
        queryKey: ['document-layout-status', space.key, document.name],
      });
    }
  }, [taskStatus, queryClient, space.key, document.name]);

  return { docLayoutStatus, startLayoutTask, taskStatus };
};
