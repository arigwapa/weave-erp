import { apiPost } from "../http";

type CloudinarySignatureRequest = {
  folder?: string;
  publicId?: string;
};

type CloudinarySignatureResponse = {
  CloudName: string;
  ApiKey: string;
  Timestamp: number;
  Folder: string;
  PublicId?: string;
  Signature: string;
};

type CloudinaryUploadResponse = {
  secure_url?: string;
  url?: string;
  error?: { message?: string };
};

export async function uploadProductImageToCloudinary(file: File): Promise<string> {
  const signature = await apiPost<CloudinarySignatureResponse>(
    "/api/uploads/cloudinary-signature",
    {
      folder: "weave-erp/products",
    } satisfies CloudinarySignatureRequest,
  );

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signature.ApiKey);
  formData.append("timestamp", String(signature.Timestamp));
  formData.append("signature", signature.Signature);
  formData.append("folder", signature.Folder);
  if (signature.PublicId) {
    formData.append("public_id", signature.PublicId);
  }

  const uploadResult = await fetch(
    `https://api.cloudinary.com/v1_1/${signature.CloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const payload = (await uploadResult.json().catch(() => ({}))) as CloudinaryUploadResponse;
  if (!uploadResult.ok) {
    throw new Error(payload?.error?.message || "Cloudinary upload failed.");
  }

  const imageUrl = payload.secure_url || payload.url;
  if (!imageUrl) {
    throw new Error("Cloudinary upload did not return an image URL.");
  }

  return imageUrl;
}
