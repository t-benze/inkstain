export interface Chunk {
  top: number;
  bottom: number;
}
export class ImageSplitter {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private image: HTMLImageElement;
  private targetHeight: number;

  constructor(image: HTMLImageElement, targetHeight = 1000) {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
    this.image = image;
    this.targetHeight = targetHeight;
  }

  public splitImage() {
    this.canvas.width = this.image.width;
    this.canvas.height = this.image.height;
    this.ctx.drawImage(this.image, 0, 0);
    console.log('original image', this.canvas.toDataURL('image/png'));
    const chunks = this.calculateChunks();
    return this.createChunks(chunks);
  }

  private calculateChunks(): Chunk[] {
    const chunks: Chunk[] = [];
    let start = 0;

    while (start < this.image.height) {
      let end = Math.min(start + this.targetHeight, this.image.height);

      if (end < this.image.height) {
        const bestSplitPoint = this.findBestSplitPoint(
          end,
          Math.min(end + 100, this.image.height)
        );
        end = bestSplitPoint;
      }

      chunks.push({ top: start, bottom: end });
      start = end;
    }

    return chunks;
  }

  private findBestSplitPoint(start: number, end: number): number {
    let bestScore = Infinity;
    let bestY = start;

    for (let y = start; y < end; y++) {
      const imageData = this.ctx.getImageData(0, y, this.image.width, 1);
      const score = this.calculateStripScore(imageData.data);

      if (score < bestScore) {
        bestScore = score;
        bestY = y;
      }

      if (score < 10) {
        break;
      }
    }

    return bestY;
  }

  private calculateStripScore(data: Uint8ClampedArray): number {
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      const grayscale = (data[i] + data[i + 1] + data[i + 2]) / 3;
      sum += grayscale;
    }
    return sum / (data.length / 4);
  }

  private createChunks(chunks: Chunk[]) {
    const chunkCanvas = document.createElement('canvas');
    const chunkData = [] as string[];
    chunks.forEach((chunk, index) => {
      chunkCanvas.width = this.image.width;
      chunkCanvas.height = chunk.bottom - chunk.top;
      const chunkCtx = chunkCanvas.getContext('2d')!;
      chunkCtx.reset();
      chunkCtx.drawImage(
        this.image,
        0,
        chunk.top,
        this.image.width,
        chunk.bottom - chunk.top,
        0,
        0,
        chunkCanvas.width,
        chunkCanvas.height
      );
      console.log('chunk', index, chunkCanvas.toDataURL('image/png'));
      chunkData.push(chunkCanvas.toDataURL('image/png'));
    });
    return chunkData;
  }
}
