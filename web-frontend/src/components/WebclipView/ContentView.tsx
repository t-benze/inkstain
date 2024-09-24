import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@fluentui/react-components';
import { Overlay as DrawingAnnotationOverlay } from '~/web/components/DrawingAnnotationOverlay';
import { useAnnotations } from '~/web/hooks/useAnnotations';
import { useDocLayout } from '~/web/hooks/useDocLayout';

const useClasses = makeStyles({
  root: {
    position: 'relative',
    margin: 'auto',
  },
  image: {},
});

interface ContentViewProps {
  imageDataUrl: string;
  onImageLoad?: (image: HTMLImageElement) => void;
  dimension: { width: number; height: number } | null;
  scale: number;
  spaceKey: string;
  documentPath: string;
}

export const ContentView = ({
  imageDataUrl,
  onImageLoad,
  dimension,
  scale,
  spaceKey,
  documentPath,
}: ContentViewProps) => {
  const { t } = useTranslation();
  const classes = useClasses();
  const { annotations, addAnnotation, deleteAnnotations, updateAnnotation } =
    useAnnotations(spaceKey, documentPath);
  const drawings = (annotations ? annotations[1] || [] : []).filter(
    (a) => a.data.type === 'drawing'
  );
  const highlights = (annotations ? annotations[1] || [] : []).filter(
    (a) => a.data.type === 'highlight'
  );

  const handleAddAnnotation = React.useCallback(
    (data: object, comment?: string) => {
      addAnnotation({
        data,
        page: 1,
        comment,
      });
    },
    [addAnnotation]
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

  const layoutData = useDocLayout({
    spaceKey,
    documentPath,
    pageNum: 1,
  });

  return (
    <div className={classes.root}>
      <img
        style={
          dimension
            ? { width: dimension.width, height: dimension.height }
            : undefined
        }
        src={imageDataUrl}
        alt="Document Content"
        onLoad={(e) => {
          onImageLoad?.(e.target as HTMLImageElement);
        }}
      />
      {dimension && (
        <DrawingAnnotationOverlay
          dimension={dimension}
          scale={scale}
          drawings={drawings}
          highlights={highlights}
          textLines={layoutData?.lines}
          textBlocks={layoutData?.blocks}
          onAddAnnotation={handleAddAnnotation}
          onUpdateAnnotation={handleUpdateAnnotation}
          onRemoveAnnotation={handleRemoveAnnotation}
        />
      )}
    </div>
  );
};
