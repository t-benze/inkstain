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
    queryKey: ['docLayout', spaceKey, documentPath, pageNum],
    queryFn: async () => {
      try {
        const analyzedResult = await intelligenceApi.intelligenceDocLayout({
          spaceKey,
          pageNum,
          path: documentPath,
        });
        const blockIdToIndex: Record<string, number> = {};
        analyzedResult.forEach((block, index) => {
          blockIdToIndex[block['id'] as string] = index;
        });
        const lineBlocks = analyzedResult
          ? analyzedResult.filter((block) => block.blockType === 'LINE')
          : [];
        const layoutBlocks = analyzedResult
          ? analyzedResult.filter((block) =>
              block.blockType?.startsWith('LAYOUT')
            )
          : [];
        layoutBlocks.forEach((block) => {
          const blocks = analyzedResult;
          if (!blocks) return;
          const children = block.relationships?.find((r) => r.type === 'CHILD');
          if (children) {
            block.text = children.ids
              ? children.ids
                  .map((id) => {
                    const lineBlock = blocks[blockIdToIndex[id]];
                    return lineBlock.text;
                  })
                  .join('\n')
              : '';
          }
        });
        return {
          analyzedResult,
          blockIdToIndex,
          lineBlocks,
          layoutBlocks,
        };
      } catch (err) {
        console.error(err);
        return null;
      }
    },
  });
  return layout;
};
