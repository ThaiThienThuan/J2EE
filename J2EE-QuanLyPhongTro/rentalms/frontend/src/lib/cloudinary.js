/**
 * Unsigned upload (upload_preset) — requires VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.
 */
export async function uploadImageToCloudinary(file) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !preset) {
    throw new Error("Chua cau hinh Cloudinary (VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET).");
  }
  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", preset);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Upload Cloudinary that bai");
  }
  const json = await res.json();
  return json.secure_url;
}
