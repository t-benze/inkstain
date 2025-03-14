export function extractWebclipData(arrayBuffer: ArrayBuffer) {
  const dataview = new DataView(arrayBuffer);
  const width = dataview.getUint32(0);
  const height = dataview.getUint32(4);
  const numOfSlices = dataview.getUint32(8);
  const slices = [];
  let offset = 0;
  for (let i = 0; i < numOfSlices; i++) {
    const sliceWidth = dataview.getUint32(12 + i * 12);
    const sliceHeight = dataview.getUint32(16 + i * 12);
    const dataLength = dataview.getUint32(20 + i * 12);
    const sliceData = new Uint8Array(
      arrayBuffer,
      12 + numOfSlices * 12 + offset,
      dataLength
    );
    const decoder = new TextDecoder();
    slices.push({
      width: sliceWidth,
      height: sliceHeight,
      imageDataUrl: decoder.decode(sliceData),
    });
    offset += dataLength;
  }
  return {
    width,
    height,
    slices,
  };
}
