import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, X, CloudUpload, FileText } from 'lucide-react';

const FileUpload = ({ onFileUpload, fileName, onClear }) => {
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
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
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileSpreadsheet className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-gray-800">{fileName}</p>
              <div className="flex items-center gap-2 mt-1">
                <FileText className="w-4 h-4 text-blue-600" />
                <p className="text-sm text-blue-700 font-medium">Excel 文件已成功加载</p>
              </div>
            </div>
          </div>
          <button
            onClick={onClear}
            className="p-2.5 bg-red-100 hover:bg-red-200 rounded-full transition-all hover:scale-110"
            title="清除文件"
          >
            <X className="w-5 h-5 text-red-600" />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`relative border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
            isDragActive
              ? 'border-blue-500 bg-blue-50 scale-[1.02] shadow-lg'
              : isDragReject
              ? 'border-red-400 bg-red-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="mb-6">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              {isDragActive ? (
                <CloudUpload className="w-10 h-10 text-blue-600 animate-bounce" />
              ) : (
                <Upload className="w-10 h-10 text-blue-600" />
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {isDragActive ? '释放文件上传' : '上传 Excel 文件'}
            </h3>
            <p className="text-gray-600 font-medium">
              {isDragActive ? '正在接收文件...' : '拖拽文件到此处或点击选择'}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <FileSpreadsheet className="w-4 h-4" />
              <span>支持格式: .xlsx, .xls</span>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
              <span className="bg-gray-100 px-3 py-1 rounded-full">最大 10MB</span>
              <span className="bg-gray-100 px-3 py-1 rounded-full">自动识别列类型</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              💡 提示: 支持"发货日期"、"销售日期"等日期列的智能识别和聚合
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
