export async function sliceImage(
  imageDataUrl: string,
  dimension: { width: number; height: number },
  maxPixelCountsPerSlice = 7000000
) {
  const img = new Image();
  // Wait for the image to load
  await new Promise<void>((resolve, reject) => {
    img.onload = () => {
      resolve();
    };
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
    const slice = document.createElement('canvas');
    slice.width = dimension.width;
    slice.height = sliceHeight;
    const sliceCtx = slice.getContext('2d');
    if (!sliceCtx) {
      throw new Error('Failed to get 2d context');
    }
    sliceCtx.drawImage(
      img,
      0,
      i * maxHeight,
      dimension.width,
      sliceHeight,
      0,
      0,
      dimension.width,
      sliceHeight
    );
    const sliceDataUrl = slice.toDataURL('image/png');
    console.log('slice', sliceDataUrl);
    slices.push({
      imageDataUrl: sliceDataUrl,
      width: dimension.width,
      height: sliceHeight,
    });
  }
  return slices;
}
