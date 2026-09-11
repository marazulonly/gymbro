/**
 * Utility to optimize user-uploaded images to standard 72 DPI screen resolution
 * and compress them safely for Firestore cloud storage and instant rendering.
 */

export interface OptimizedImageResult {
  dataUrl: string;
  originalSize: number;
  optimizedSize: number;
  width: number;
  height: number;
  mimeType: string;
}

/**
 * Optimizes an image to standard 72 DPI display resolution (max 1200x1200px)
 * and compresses it with high quality JPEG encoding.
 */
export async function optimizeImageTo72Dpi(
  file: File | Blob,
  maxDimension = 1200,
  quality = 0.8
): Promise<OptimizedImageResult> {
  return new Promise((resolve, reject) => {
    const originalSize = file.size;
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Calculate proportional scale to standard web/screen dimensions (72 DPI)
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        // Draw to HTML Canvas
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No se pudo obtener el contexto del lienzo (canvas)"));
          return;
        }

        // Clean white background for transparent PNGs converted to JPEG
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);

        // High quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to optimized JPEG dataUrl (equivalent to 72 DPI web resolution)
        const mimeType = "image/jpeg";
        const dataUrl = canvas.toDataURL(mimeType, quality);

        // Estimate optimized size in bytes from base64 string
        const base64Length = dataUrl.length - (dataUrl.indexOf(",") + 1);
        const optimizedSize = Math.round((base64Length * 3) / 4);

        resolve({
          dataUrl,
          originalSize,
          optimizedSize,
          width,
          height,
          mimeType,
        });
      };

      img.onerror = (err) => {
        reject(new Error("Error al cargar la imagen para procesamiento"));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = (err) => {
      reject(new Error("Error al leer el archivo de imagen"));
    };

    reader.readAsDataURL(file);
  });
}
