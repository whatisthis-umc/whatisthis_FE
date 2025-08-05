import React, { useState, useRef } from "react";
import { uploadService } from "../../api/uploadApi";

interface ImageUploadProps {
  onImagesUploaded: (urls: string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImagesUploaded,
  multiple = true,
  maxFiles = 5,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // 파일 개수 제한 확인
    if (multiple && files.length > maxFiles) {
      alert(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
      return;
    }

    setUploading(true);
    try {
      const urls = await uploadService.uploadImages(files);
      setUploadedUrls((prev) => [...prev, ...urls]);
      onImagesUploaded(urls);
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      alert("이미지 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (index: number) => {
    setUploadedUrls((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {uploading ? "업로드 중..." : "이미지 선택"}
        </label>
        {multiple && (
          <span className="text-sm text-gray-500">
            최대 {maxFiles}개 파일 선택 가능
          </span>
        )}
      </div>

      {/* 업로드된 이미지 미리보기 */}
      {uploadedUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {uploadedUrls.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`업로드된 이미지 ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 업로드된 URL 목록 */}
      {uploadedUrls.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">업로드된 이미지 URL:</h4>
          <div className="space-y-1">
            {uploadedUrls.map((url, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{index + 1}.</span>
                <input
                  type="text"
                  value={url}
                  readOnly
                  className="flex-1 text-sm bg-gray-100 px-2 py-1 rounded"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(url)}
                  className="text-blue-500 hover:text-blue-600 text-sm"
                >
                  복사
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
