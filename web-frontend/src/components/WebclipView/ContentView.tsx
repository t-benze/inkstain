import { useTranslation } from 'react-i18next';
import { makeStyles } from '@fluentui/react-components';
import { ImageSlice } from './ImageSlice';

const useClasses = makeStyles({
  root: {
    position: 'relative',
    margin: 'auto',
  },
  image: {},
});

interface ContentViewProps {
  imageData: Array<{
    imageDataUrl: string;
    width: number;
    height: number;
  }>;
  dimension: { width: number; height: number } | null;
  scale: number;
  spaceKey: string;
  documentPath: string;
  onTextBlockSelected?: (blockId: string) => void;
}

export const ContentView = ({
  imageData,
  dimension,
  scale,
  onTextBlockSelected,
}: ContentViewProps) => {
  const classes = useClasses();
  const imageWidth = dimension?.width ? scale * dimension.width : 0;
  const imageHeight = dimension?.height ? scale * dimension.height : 0;
  const offsetPos = imageData.reduce((acc, data) => {
    if (acc.length === 0) {
      return [data.height];
    }
    return [...acc, acc[acc.length - 1] + data.height];
  }, [] as number[]);

  return (
    <div
      className={classes.root}
      style={{ width: imageWidth, height: imageHeight }}
    >
      {imageData.map((data, index) => (
        <ImageSlice
          sliceIndex={index}
          key={index}
          width={data.width}
          height={data.height}
          scale={scale}
          imageDataUrl={data.imageDataUrl}
          offset={index === 0 ? 0 : offsetPos[index - 1]}
          onTextBlockSelected={onTextBlockSelected}
        />
      ))}
    </div>
  );
};
