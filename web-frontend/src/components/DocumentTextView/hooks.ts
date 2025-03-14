import { useQuery } from '@tanstack/react-query';
import { intelligenceApi } from '~/web/apiClient';

export const useDocumentText = (spaceKey: string, documentPath: string) => {
  const { data } = useQuery({
    queryKey: ['document-text', spaceKey, documentPath],
    queryFn: async () => {
      const response = await intelligenceApi.intelligenceDocTextContent({
        spaceKey,
        path: documentPath,
      });
      return response;
    },
  });
  return {
    data,
  };
};
