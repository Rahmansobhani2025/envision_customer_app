/**
 * Phone photos are often 3-8 MB. Vercel rejects request bodies over 4.5 MB, so images are
 * scaled down (max 1600 px, JPEG) before being sent to the server. PDFs/other files pass through.
 */
export function shrinkDataUrl(dataUrl: string, maxSide = 1600, quality = 0.82): Promise<string> {
  return new Promise((resolve) => {
    if (!dataUrl.startsWith("data:image/")) return resolve(dataUrl);
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(dataUrl);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const out = canvas.toDataURL("image/jpeg", quality);
        resolve(out.length < dataUrl.length ? out : dataUrl);
      } catch { resolve(dataUrl); }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
