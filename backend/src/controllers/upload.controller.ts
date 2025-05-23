import { Request, Response } from "express";

interface MulterRequest extends Request {
  file: any;
}

/**
 * Upload a file to Cloudinary
 */
export const uploadFile = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const file = (req as MulterRequest).file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Return the file URL and other details
    // When using multer-storage-cloudinary, the file path contains the URL
    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      data: {
        fileUrl: file.path,
        fileId: file.filename,
      },
    });
  } catch (error) {
    console.error("File upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Error uploading file",
    });
  }
};
