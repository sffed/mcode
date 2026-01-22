import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, X } from 'lucide-react';

const FileUpload = ({ onFileUpload, fileName, onClear }) => {
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
  });

  return (
    <div className="w-full">
      {fileName ? (
        <div className="flex items-center justify-between p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-8 h-8 text-blue-600" />
            <div>
              <p className="font-medium text-gray-800">{fileName}</p>
              <p className="text-sm text-gray-500">Excel 文件已加载</p>
            </div>
          </div>
          <button
            onClick={onClear}
            className="p-2 hover:bg-red-100 rounded-full transition-colors"
            title="清除文件"
          >
            <X className="w-5 h-5 text-red-600" />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            {isDragActive ? '释放文件' : '上传 Excel 文件'}
          </p>
          <p className="text-sm text-gray-500">
            支持格式: .xlsx, .xls
          </p>
          <p className="text-xs text-gray-400 mt-2">
            点击或拖拽文件到此处
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
