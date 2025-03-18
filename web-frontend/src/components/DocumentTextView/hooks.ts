import * as React from 'react';
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

export const useDocumentTextOverlay = () => {
  const [showTextOverlay, setShowTextOverlay] = React.useState(false);
  const [initBlockId, setInitBlockId] = React.useState<string>();
  const openTextOverlay = (blockId?: string) => {
    blockId && setInitBlockId(blockId);
    setShowTextOverlay(true);
  };
  const closeTextOverlay = () => {
    setShowTextOverlay(false);
  };
  return {
    showTextOverlay,
    openTextOverlay,
    initBlockId,
    closeTextOverlay,
  };
};
