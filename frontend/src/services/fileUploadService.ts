import apiClient from "./api";
import { ApiResponse } from "./errorTypes";

export interface FileUploadResponse {
  fileUrl: string;
  fileId: string;
}

const fileUploadService = {
  // Upload a file and get back the URL
  uploadFile: async (file: File): Promise<ApiResponse<FileUploadResponse>> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiClient.post<ApiResponse<FileUploadResponse>>(
        "/uploads",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error uploading file:", error);
      return {
        success: false,
        message: "Failed to upload file. Please try again.",
        data: undefined,
      };
    }
  },
};

export default fileUploadService;
