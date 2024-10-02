import { useQuery } from '@tanstack/react-query';
import { intelligenceApi } from '~/web/apiClient';

export const useDocLayout = ({
  spaceKey,
  documentPath,
  pageNum = 1,
}: {
  spaceKey: string;
  documentPath: string;
  pageNum?: number;
}) => {
  const { data: layout } = useQuery({
    queryKey: ['document-layout', spaceKey, documentPath, pageNum],
    queryFn: async () => {
      try {
        const analyzedResult = await intelligenceApi.intelligenceDocLayout({
          spaceKey,
          pageNum,
          path: documentPath,
        });
        return analyzedResult.data ? analyzedResult.data : null;
      } catch (err) {
        return null;
      }
    },
  });
  return layout;
};
