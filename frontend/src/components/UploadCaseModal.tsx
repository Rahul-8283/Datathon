import React, { useState, useEffect } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { uploadCaseFile, checkTaskStatus } from '../services/api';

interface UploadCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const UploadCaseModal: React.FC<UploadCaseModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [status, setStatus] = useState<'IDLE' | 'UPLOADING' | 'PROCESSING' | 'SUCCESS' | 'FAILURE'>('IDLE');
  const [entitiesExtracted, setEntitiesExtracted] = useState<number | null>(null);

  useEffect(() => {
    let intervalId: ReturnType<typeof setTimeout>;

    if (taskId && (status === 'PROCESSING' || status === 'UPLOADING')) {
      intervalId = setInterval(async () => {
        try {
          const res = await checkTaskStatus(taskId);
          if (res.status === 'SUCCESS') {
            setStatus('SUCCESS');
            setEntitiesExtracted(res.result?.entities_extracted || 0);
            clearInterval(intervalId);
            onSuccess(); // Refresh the list
          } else if (res.status === 'FAILURE') {
            setStatus('FAILURE');
            setError(res.info?.error || 'Task failed during processing.');
            clearInterval(intervalId);
          } else if (res.status === 'PROCESSING' || res.status === 'PENDING') {
            setStatus('PROCESSING');
          }
        } catch (err: any) {
          console.error("Error checking status", err);
        }
      }, 2000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [taskId, status, onSuccess]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setStatus('UPLOADING');

    try {
      const res = await uploadCaseFile(file);
      setTaskId(res.task_id);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload file.');
      setStatus('FAILURE');
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setTaskId(null);
    setStatus('IDLE');
    setError(null);
    setEntitiesExtracted(null);
    setIsUploading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#0c211b] border border-white/10 rounded-none shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <h2 className="text-lg font-semibold tracking-wide text-white font-display">AI INGESTION PORTAL</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {status === 'IDLE' || status === 'FAILURE' ? (
            <>
              {error && (
                <div className="flex items-start gap-2 bg-[#ef7763]/10 border border-[#ef7763]/20 p-3">
                  <AlertCircle size={18} className="text-[#ef7763] shrink-0 mt-0.5" />
                  <p className="text-sm text-[#ef7763]">{error}</p>
                </div>
              )}

              <div className="border-2 border-dashed border-white/10 hover:border-[#c6a75b]/50 bg-white/[0.02] transition-colors p-8 flex flex-col items-center justify-center text-center">
                <Upload size={32} className="text-slate-400 mb-4" />
                <p className="text-sm text-slate-300 font-medium mb-1">Select a case file to ingest</p>
                <p className="text-xs text-slate-500 mb-6">Supports .txt, .csv, .md (Max 5MB)</p>
                
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".txt,.csv,.md"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer bg-white/5 border border-white/10 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 transition-colors uppercase tracking-wider"
                >
                  {file ? file.name : "BROWSE FILES"}
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors uppercase tracking-wider"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={!file}
                  className="px-4 py-2 text-xs font-semibold bg-[#c6a75b]/10 border border-[#c6a75b] text-[#e2c979] hover:bg-[#c6a75b]/25 transition-colors uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  START AI EXTRACTION
                </button>
              </div>
            </>
          ) : status === 'SUCCESS' ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
              <CheckCircle size={48} className="text-emerald-500" />
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Ingestion Complete</h3>
                <p className="text-sm text-slate-400">Successfully extracted <span className="text-[#c6a75b] font-bold">{entitiesExtracted}</span> entities.</p>
              </div>
              <button
                onClick={() => {
                  handleReset();
                  onClose();
                }}
                className="mt-4 px-6 py-2 text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors uppercase tracking-wider"
              >
                DONE
              </button>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
              <Loader2 size={40} className="text-[#c6a75b] animate-spin" />
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#d8bb70] mb-2">
                  {status === 'UPLOADING' ? 'Uploading...' : 'AI Processing in Background'}
                </h3>
                <p className="text-xs text-slate-400 max-w-[250px] mx-auto">
                  Extracting entities, relationships, and generating modus operandi summary.
                </p>
              </div>
              
              {/* Progress bar visual only */}
              <div className="w-full max-w-[200px] h-1 bg-white/10 overflow-hidden">
                <div className="h-full bg-[#c6a75b] w-1/2 animate-[progress_1s_ease-in-out_infinite_alternate]" style={{ transformOrigin: 'left' }} />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Add custom animation in style block */}
      <style>{`
        @keyframes progress {
          0% { transform: scaleX(0.1); transform-origin: left; }
          50% { transform: scaleX(1); transform-origin: left; }
          50.1% { transform: scaleX(1); transform-origin: right; }
          100% { transform: scaleX(0.1); transform-origin: right; }
        }
      `}</style>
    </div>
  );
};

export default UploadCaseModal;
