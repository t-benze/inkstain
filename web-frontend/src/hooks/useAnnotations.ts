import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Annotation } from '@inkstain/client-api';
import { documentsApi } from '~/web/apiClient';

export const useAnnotations = (spaceKey: string, documentPath: string) => {
  const queryClient = useQueryClient();
  const { data: annotations } = useQuery({
    queryKey: ['document-annotations', spaceKey, documentPath],
    queryFn: async () => {
      const data = await documentsApi.getDocumentAnnotations({
        spaceKey,
        path: documentPath,
      });
      return data.reduce((acc, annotation) => {
        if (!acc[annotation.page]) acc[annotation.page] = [];
        acc[annotation.page].push(annotation);
        return acc;
      }, {} as Record<number, Annotation[]>);
    },
  });
  const addAnnotationMutation = useMutation({
    mutationFn: async ({
      data,
      page = 1,
      comment,
    }: {
      data: object;
      page?: number;
      comment?: string;
    }) => {
      await documentsApi.addDocumentAnnotation({
        spaceKey: spaceKey,
        path: documentPath,
        annotation: {
          id: '',
          data,
          page,
          comment,
        },
      });
    },
    onMutate: async ({ data, page = 1, comment }) => {
      await queryClient.cancelQueries({
        queryKey: ['document-annotations', spaceKey, documentPath],
      });
      const previousData = queryClient.getQueryData<
        Record<number, Annotation[]>
      >(['document-annotations', spaceKey, documentPath]);
      if (previousData) {
        if (!previousData[page]) {
          previousData[page] = [];
        }
        previousData[page].push({
          id: '',
          data,
          page,
          comment,
        });
      }
      return { previousData };
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['document-annotations', spaceKey, documentPath],
      });
    },
  });
  const updateAnnotation = useMutation({
    mutationFn: async ({
      id,
      data,
      comment,
      page = 1,
    }: {
      data: object;
      id: string;
      comment?: string;
      page?: number;
    }) => {
      await documentsApi.updateDocumentAnnotation({
        spaceKey: spaceKey,
        path: documentPath,
        annotation: {
          id,
          page,
          data,
          comment,
        },
      });
    },
    onMutate: async ({ id, data, comment, page = 1 }) => {
      await queryClient.cancelQueries({
        queryKey: ['document-annotations', spaceKey, documentPath],
      });
      const previousData = queryClient.getQueryData<
        Record<number, Annotation[]>
      >(['document-annotations', spaceKey, documentPath]);
      if (previousData) {
        const annotations = previousData[page];
        const index = annotations.findIndex((a) => a.id === id);
        if (index >= 0) {
          annotations[index] = {
            id,
            data,
            page,
            comment,
          };
        }
      }
      return { previousData };
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['document-annotations', spaceKey, documentPath],
      });
    },
  });
  const deleteAnnotationsMutation = useMutation({
    mutationFn: async (ids: Array<string>) => {
      await documentsApi.deleteDocumentAnnotations({
        spaceKey: spaceKey,
        path: documentPath,
        requestBody: ids,
      });
    },
    onMutate: (ids: Array<string>) => {
      queryClient.cancelQueries({
        queryKey: ['document-annotations', spaceKey, documentPath],
      });
      const previousData = queryClient.getQueryData<
        Record<number, Annotation[]>
      >(['document-annotations', spaceKey, documentPath]);
      if (previousData) {
        for (const page in previousData) {
          previousData[page] = previousData[page].filter(
            (annotation) => !ids.includes(annotation.id)
          );
        }
      }
      return { previousData };
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['document-annotations', spaceKey, documentPath],
      });
    },
  });
  return {
    annotations,
    addAnnotation: addAnnotationMutation.mutate,
    updateAnnotation: updateAnnotation.mutate,
    deleteAnnotations: deleteAnnotationsMutation.mutate,
  };
};
