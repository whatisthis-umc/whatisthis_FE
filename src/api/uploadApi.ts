// src/api/uploadApi.ts
import { axiosInstance } from "./axiosInstance";

export interface UploadResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: string[];
}

export const uploadService = {
  /**
   * 이미지 업로드
   * @param files 업로드할 파일들 (File[] 또는 FileList)
   */
  uploadImages: (files: File[] | FileList): Promise<string[]> => {
    const formData = new FormData();
    
    // FileList를 File[]로 변환
    const fileArray = Array.from(files);
    
    // 각 파일을 formData에 추가
    fileArray.forEach((file) => {
      formData.append('files', file);
    });

    return axiosInstance
      .post<UploadResponse>('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('adminAccessToken')}`,
        },
      })
      .then((res) => {
        if (!res.data.isSuccess) {
          return Promise.reject(res.data.message);
        }
        return res.data.result;
      })
      .catch((error) => {
        console.error('Upload error:', error);
        if (error.response?.status === 403) {
          return Promise.reject('업로드 권한이 없습니다. 로그인을 확인해주세요.');
        }
        return Promise.reject(error.message || '업로드에 실패했습니다.');
      });
  },

  /**
   * 단일 이미지 업로드
   * @param file 업로드할 파일
   */
  uploadImage: (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('files', file);

    return axiosInstance
      .post<UploadResponse>('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('adminAccessToken')}`,
        },
      })
      .then((res) => {
        if (!res.data.isSuccess) {
          return Promise.reject(res.data.message);
        }
        return res.data.result[0]; // 첫 번째 URL 반환
      })
      .catch((error) => {
        console.error('Upload error:', error);
        if (error.response?.status === 403) {
          return Promise.reject('업로드 권한이 없습니다. 로그인을 확인해주세요.');
        }
        return Promise.reject(error.message || '업로드에 실패했습니다.');
      });
  },
}; 