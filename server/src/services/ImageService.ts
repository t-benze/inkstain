import { Canvas, Image } from 'canvas';

export class ImageService {
  public async sliceImage(
    imageDataUrl: string,
    dimension: { width: number; height: number },
    maxPixelCountsPerSlice: number
  ) {
    const img = new Image();
    // Wait for the image to load
    await new Promise<void>((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageDataUrl;
    });
    const maxHeight = maxPixelCountsPerSlice / dimension.width;
    const sliceCount = Math.ceil(dimension.height / maxHeight);
    const slices: {
      imageDataUrl: string;
      width: number;
      height: number;
    }[] = [];
    for (let i = 0; i < sliceCount; i++) {
      const sliceHeight = Math.min(maxHeight, dimension.height - i * maxHeight);
      const slice = new Canvas(dimension.width, sliceHeight);
      const sliceCtx = slice.getContext('2d');
      sliceCtx.drawImage(img, 0, i * maxHeight, dimension.width, sliceHeight);
      slices.push({
        imageDataUrl: slice.toDataURL('image/png'),
        width: dimension.width,
        height: sliceHeight,
      });
    }
    return slices;
  }
}
