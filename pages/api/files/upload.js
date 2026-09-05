import { v2 as cloudinary } from "cloudinary";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// =====================================================
// PARSE FORM DATA
// =====================================================

const parseForm = async (req) => {
  const form = formidable({
    multiples: false,
    keepExtensions: true,
    maxFileSize: 50 * 1024 * 1024, // 50 MB
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }

      resolve({ fields, files });
    });
  });
};

// =====================================================
// UPLOAD API
// =====================================================

import { requireAuth } from "@/lib/auth";

export default async function handler(req, res) {

    const auth = await requireAuth(req, res);

    if (!auth.authenticated) {
        return res.status(401).json({
            error: "Authentication required",
        });
    }
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Only POST requests are allowed",
    });
  }

  let filePath = null;

  try {
    // -----------------------------------------------
    // PARSE REQUEST
    // -----------------------------------------------

    const { fields, files } = await parseForm(req);

    const uploadedFile = Array.isArray(files.file)
      ? files.file[0]
      : files.file;

    if (!uploadedFile) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    filePath = uploadedFile.filepath;

    // -----------------------------------------------
    // FILE INFORMATION
    // -----------------------------------------------

    const originalName =
      uploadedFile.originalFilename || "file";

    const mimeType =
      uploadedFile.mimetype || "application/octet-stream";

    const fileSize = uploadedFile.size || 0;

    // -----------------------------------------------
    // OPTIONAL FOLDER
    // -----------------------------------------------

    let folder = "tradeintel";

    if (fields.folder) {
      folder = Array.isArray(fields.folder)
        ? fields.folder[0]
        : fields.folder;
    }

    // Prevent strange folder traversal
    folder = String(folder)
      .replace(/[^a-zA-Z0-9/_-]/g, "")
      .replace(/\.\./g, "");

    if (!folder) {
      folder = "tradeintel";
    }

    // -----------------------------------------------
    // DETERMINE RESOURCE TYPE
    // -----------------------------------------------

    let resourceType = "auto";

    if (mimeType.startsWith("image/")) {
      resourceType = "image";
    } else if (mimeType.startsWith("video/")) {
      resourceType = "video";
    } else {
      resourceType = "raw";
    }

    // -----------------------------------------------
    // UPLOAD TO CLOUDINARY
    // -----------------------------------------------

    const result = await cloudinary.uploader.upload(
      filePath,
      {
        folder,
        resource_type: resourceType,

        // Keep original filename information
        use_filename: true,
        unique_filename: true,

        // Don't overwrite an existing file
        overwrite: false,
      }
    );

    // -----------------------------------------------
    // DELETE TEMPORARY FILE
    // -----------------------------------------------

    try {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (cleanupError) {
      console.error(
        "Temporary file cleanup error:",
        cleanupError
      );
    }

    // -----------------------------------------------
    // RESPONSE
    // -----------------------------------------------

    return res.status(200).json({
      success: true,

      message: "File uploaded successfully",

      data: {
        url: result.secure_url,

        publicId: result.public_id,

        resourceType: result.resource_type,

        format: result.format,

        originalName,

        mimeType,

        size: fileSize,

        width: result.width || null,

        height: result.height || null,

        createdAt: result.created_at,
      },
    });
  } catch (error) {
    console.error("Upload API Error:", error);

    // Cleanup temporary file if upload failed
    try {
      if (
        filePath &&
        fs.existsSync(filePath)
      ) {
        fs.unlinkSync(filePath);
      }
    } catch (cleanupError) {
      console.error(
        "Cleanup error:",
        cleanupError
      );
    }

    if (
      error.code === "LIMIT_FILE_SIZE" ||
      error.message?.includes("maxFileSize")
    ) {
      return res.status(413).json({
        success: false,
        message:
          "File is too large. Maximum size is 50MB.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "File upload failed",
      error: error.message,
    });
  }
}