import * as React from 'react';
import { Overlay as DrawingAnnotationOverlay } from '~/web/components/DrawingAnnotationOverlay';
import { useAnnotations } from '~/web/hooks/useAnnotations';
import { useDocLayout } from '~/web/hooks/useDocLayout';
import { useDocumentContext } from '~/web/components/DocumentView/hooks';

type ImageSliceProps = {
  scale: number;
  width: number;
  height: number;
  offset: number;
  imageDataUrl: string;
  sliceIndex: number;
  onTextBlockSelected?: (blockId: string) => void;
};

export const ImageSlice = ({
  imageDataUrl,
  width,
  height,
  offset,
  scale,
  sliceIndex,
  onTextBlockSelected,
}: ImageSliceProps) => {
  const { space, document } = useDocumentContext();
  const spaceKey = space.key;
  const documentPath = document.name;
  const pageNum = sliceIndex + 1;
  const layoutData = useDocLayout({
    spaceKey,
    documentPath,
    pageNum,
  });
  const { annotations, addAnnotation, deleteAnnotations, updateAnnotation } =
    useAnnotations(spaceKey, documentPath);
  const drawings = (annotations ? annotations[pageNum] || [] : []).filter(
    (a) => a.data.type === 'drawing'
  );
  const highlights = (annotations ? annotations[pageNum] || [] : []).filter(
    (a) => a.data.type === 'highlight'
  );

  const handleAddAnnotation = React.useCallback(
    (data: object, comment?: string) => {
      addAnnotation({
        data,
        page: pageNum,
        comment,
      });
    },
    [addAnnotation, pageNum]
  );

  const handleUpdateAnnotation = React.useCallback(
    (id: string, data: object, comment?: string) => {
      updateAnnotation({
        data,
        id,
        comment,
      });
    },
    [updateAnnotation]
  );

  const handleRemoveAnnotation = React.useCallback(
    (id: string) => {
      deleteAnnotations([id]);
    },
    [deleteAnnotations]
  );

  const scaledWidth = width * scale;
  const scaledHeight = height * scale;
  const scaledTop = offset * scale;
  return (
    <div
      style={{
        position: 'absolute',
        width: scaledWidth,
        height: scaledHeight,
        top: scaledTop,
      }}
    >
      <img
        style={{
          width: scaledWidth,
          height: scaledHeight,
        }}
        src={imageDataUrl}
        alt="Document Content"
      />
      <DrawingAnnotationOverlay
        dimension={{ width: scaledWidth, height: scaledHeight }}
        scale={scale}
        drawings={drawings}
        highlights={highlights}
        textLines={layoutData?.lines}
        textBlocks={layoutData?.blocks}
        onAddAnnotation={handleAddAnnotation}
        onUpdateAnnotation={handleUpdateAnnotation}
        onRemoveAnnotation={handleRemoveAnnotation}
        onTextBlockSelected={onTextBlockSelected}
      />
    </div>
  );
};
