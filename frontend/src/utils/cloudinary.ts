/**
 * Returns a Cloudinary URL that serves a resized, auto-format/auto-quality
 * version of the image (never upscaled). Non-Cloudinary URLs (e.g. bundled
 * assets) are returned unchanged.
 *
 * Example: .../image/upload/v123/ppac/x.jpg
 *       -> .../image/upload/c_limit,w_600,f_auto,q_auto/v123/ppac/x.jpg
 */
export const cloudinaryResize = <T extends string | undefined>(url: T, width: number): T => {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
    return url;
  }
  return url.replace("/image/upload/", `/image/upload/c_limit,w_${width},f_auto,q_auto/`) as T;
};
