'use client';

import React, { useState, useRef } from 'react';
import { useBorrowerStore } from '../../stores/useBorrowerStore';
import { getAuthToken } from '../../lib/api';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  ArrowLeft,
  File,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

export const Step3UploadSlip: React.FC = () => {
  const { salarySlip, setSalarySlip, nextStep, prevStep } = useBorrowerStore();

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    setErrorMsg(null);

    // Format validation
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMsg('Invalid file format. Please upload a PDF, PNG, or JPG file.');
      return;
    }

    // Size validation: max 5 MB
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMsg(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds maximum allowed limit of 5 MB.`);
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${baseUrl}/upload/salary-slip`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const res = await response.json();

      if (response.ok && res.success && res.file) {
        setSalarySlip({
          publicId: res.file.publicId,
          secureUrl: res.file.secureUrl,
          fileName: res.file.fileName,
          fileSize: res.file.fileSize,
          mimeType: res.file.mimeType,
        });
      } else {
        setErrorMsg(res.message || 'File upload failed. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error occurred during file upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm">
      <div className="pb-6 mb-6 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Upload Salary Slip
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Step 3 of 4: Provide your latest salary slip / bank statement for income verification (PDF/JPG/PNG, max 5 MB)
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Upload Box or Document Preview Card */}
      {!salarySlip ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-[#0075FF] bg-blue-50/50 dark:bg-blue-950/30'
              : 'border-gray-300 dark:border-gray-700 hover:border-[#0075FF] dark:hover:border-[#0075FF] bg-gray-50/50 dark:bg-gray-800/30'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileProcess(e.target.files[0]);
              }
            }}
            accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
            className="hidden"
          />

          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#0075FF14] text-[#0075FF] flex items-center justify-center">
            {isUploading ? (
              <div className="w-8 h-8 border-3 border-[#0075FF] border-t-transparent rounded-full animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
            {isUploading ? 'Uploading Document to Cloudinary...' : 'Click to Upload or Drag & Drop'}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Supported formats: PDF, JPG, PNG (Maximum file size: 5 MB)
          </p>

          <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Encrypted cloud document storage</span>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/20">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                    {salarySlip.fileName}
                  </h4>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified & Linked
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {(salarySlip.fileSize / 1024).toFixed(1)} KB • {salarySlip.mimeType}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSalarySlip(null)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              title="Remove document"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-emerald-500/20 flex items-center justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400 font-mono text-[11px]">
              ID: {salarySlip.publicId}
            </span>
            <a
              href={salarySlip.secureUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#0075FF] hover:underline font-semibold"
            >
              <span>Preview Document</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200 dark:border-gray-800">
        <button
          type="button"
          onClick={prevStep}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={nextStep}
          disabled={!salarySlip}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-[#0075FF] hover:bg-[#0066DD] disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <span>Configure Loan Terms</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
