import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Plus, ChevronLeft, ChevronRight, Trash2, Calendar, MapPin, Tag, FileText, AlertCircle, RefreshCw } from 'lucide-react';
import { getCases, createCase, deleteCase } from '../services/api';
import type { CaseResponse } from '../services/api';
import UploadCaseModal from '../components/UploadCaseModal';

const INITIAL_DEMO_CASES: CaseResponse[] = [
  {
    id: '11000000-0000-0000-0000-000000000001',
    fir_number: 'KSP/BLR/2026/001',
    date_reported: '2026-07-24T10:15:00Z',
    district: 'Bengaluru Urban',
    status: 'Open',
    description: 'Commercial break-in reported at an electronics warehouse in Indiranagar. Multiple laptops and smartphones stolen.',
    created_at: '2026-07-24T10:15:00Z',
    updated_at: '2026-07-24T10:15:00Z',
  },
  {
    id: '11000000-0000-0000-0000-000000000002',
    fir_number: 'KSP/MYS/2026/014',
    date_reported: '2026-07-23T14:30:00Z',
    district: 'Mysuru',
    status: 'Under Investigation',
    description: 'Chain snatching incident near Chamundi Hill foot steps by two unidentified suspects on a black Pulsar motorcycle.',
    created_at: '2026-07-23T14:30:00Z',
    updated_at: '2026-07-23T14:30:00Z',
  },
  {
    id: '11000000-0000-0000-0000-000000000003',
    fir_number: 'KSP/HBD/2026/008',
    date_reported: '2026-07-22T09:00:00Z',
    district: 'Hubballi-Dharwad',
    status: 'Open',
    description: 'Cyber financial fraud. Victim deceived via fake SIM swap call, losing INR 1,20,000 from savings account.',
    created_at: '2026-07-22T09:00:00Z',
    updated_at: '2026-07-22T09:00:00Z',
  },
  {
    id: '11000000-0000-0000-0000-000000000004',
    fir_number: 'KSP/MNG/2026/029',
    date_reported: '2026-07-20T18:45:00Z',
    district: 'Mangaluru (Dakshina Kannada)',
    status: 'Closed',
    description: 'Vehicle theft reported at Panambur Beach parking lot. Vehicle recovered within 24 hours.',
    created_at: '2026-07-20T18:45:00Z',
    updated_at: '2026-07-20T18:45:00Z',
  },
  {
    id: '11000000-0000-0000-0000-000000000005',
    fir_number: 'KSP/BLG/2026/012',
    date_reported: '2026-07-19T22:10:00Z',
    district: 'Belagavi',
    status: 'Cold',
    description: 'Nighttime warehouse breaking and entering near industrial estate. Copper wiring and machinery parts stolen.',
    created_at: '2026-07-19T22:10:00Z',
    updated_at: '2026-07-19T22:10:00Z',
  },
];

const CaseLedger: React.FC = () => {
  const [allCases, setAllCases] = useState<CaseResponse[]>(INITIAL_DEMO_CASES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [firNumber, setFirNumber] = useState('');
  const [dateReported, setDateReported] = useState('');
  const [district, setDistrict] = useState('');
  const [status, setStatus] = useState('Open');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchCases = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load dataset within API limit of 500
      const data = await getCases(0, 500);
      if (data && data.length > 0) {
        setAllCases(data);
      } else {
        setAllCases(INITIAL_DEMO_CASES);
      }
    } catch (err: any) {
      console.error('Error fetching cases:', err);
      setAllCases(INITIAL_DEMO_CASES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  // Filter cases client-side for immediate responsive search experience on full ledger
  const filteredCases = (allCases || []).filter((c) => {
    const query = searchQuery?.toLowerCase() || '';
    return (
      (c?.fir_number?.toLowerCase().includes(query)) ||
      (c?.district?.toLowerCase().includes(query)) ||
      (c?.status?.toLowerCase().includes(query)) ||
      (c?.description?.toLowerCase().includes(query))
    );
  });

  // Calculate displayed slice and hasMore dynamically on filtered cases
  const displayedCases = (filteredCases || []).slice((page - 1) * limit, page * limit);
  const hasMore = (filteredCases || []).length > page * limit;

  // Reset page to 1 whenever search query changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (hasMore) {
      setPage(page + 1);
    }
  };

  const handleOpenModal = () => {
    // Reset form and open
    setFirNumber('');
    // Format current local time for datetime-local input
    const now = new Date();
    const formattedNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setDateReported(formattedNow);
    setDistrict('');
    setStatus('Open');
    setDescription('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firNumber.trim() || !dateReported || !district.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);

    try {
      // API expects ISO datetime string
      const formattedDate = new Date(dateReported).toISOString();
      const payload = {
        fir_number: firNumber.trim(),
        date_reported: formattedDate,
        district: district.trim(),
        status,
        description: description.trim() || undefined,
      };

      await createCase(payload);
      setIsModalOpen(false);
      // Reset search query and reload full dataset
      setSearchQuery('');
      setPage(1);
      fetchCases();
    } catch (err: any) {
      console.error('Error creating case:', err);
      setFormError(err.response?.data?.detail || 'Failed to create case record.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (caseId: string, firNum: string) => {
    if (!confirm(`Are you sure you want to delete case FIR ${firNum}?`)) {
      return;
    }

    try {
      await deleteCase(caseId);
      // Refresh full dataset
      fetchCases();
    } catch (err: any) {
      console.error('Error deleting case:', err);
      alert(err.response?.data?.detail || 'Failed to delete case record.');
    }
  };



  const getStatusBadgeClass = (statusStr: string) => {
    switch (statusStr?.toLowerCase()) {
      case 'open':
        return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';
      case 'closed':
        return 'border-[#c6a75b]/20 bg-[#c6a75b]/10 text-[#d8bb70]';
      case 'cold':
      default:
        return 'border-[#ef7763]/20 bg-[#ef7763]/10 text-[#ef7763]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#d8bb70]">Source of Truth Ledger</p>
          <h1 className="font-display mt-2 text-2xl font-semibold tracking-[-.035em] text-white sm:text-3xl">
            Cases Ledger
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Relational records of KSP FIR case files, officer reporting logs, and active status registers.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-none border border-emerald-500 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/25 transition-all cursor-pointer"
          >
            <Plus size={16} /> UPLOAD AI CASE
          </button>
          <button
            onClick={handleOpenModal}
            className="inline-flex items-center gap-2 rounded-none border border-[#c6a75b] bg-[#c6a75b]/10 px-4 py-2.5 text-xs font-semibold text-[#e2c979] hover:bg-[#c6a75b]/25 transition-all cursor-pointer"
          >
            <Plus size={16} /> LOG NEW CASE
          </button>
        </div>
      </div>

      {/* Main Ledger Content */}
      <div className="rounded-none border border-white/8 bg-[#0c211b] p-5 sm:p-6">
        
        {/* Search & Actions Bar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <SearchIcon size={16} />
            </span>
            <input
              type="text"
              placeholder="Search ledger by FIR, district, status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-none border border-white/8 bg-white/[0.02] pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-[#c6a75b] focus:outline-none transition-all"
            />
          </div>
          
          <button
            onClick={() => fetchCases()}
            className="flex items-center justify-center gap-2 rounded-none border border-white/8 bg-white/[0.02] px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all"
            title="Refresh Ledger"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-emerald-300' : ''} />
            REFRESH
          </button>
        </div>

        {/* Errors / Loading States */}
        {error && (
          <div className="flex items-center gap-3 rounded-none border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-left text-sm text-slate-300">
            <thead>
              <tr className="border-b border-white/8 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="pb-3 pl-4">FIR Number</th>
                <th className="pb-3">Date Reported</th>
                <th className="pb-3">District</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Description</th>
                <th className="pb-3 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/7">
              {loading ? (
                // Skeleton Rows
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 pl-4"><div className="h-4 w-32 bg-white/5 rounded-none" /></td>
                    <td className="py-4"><div className="h-4 w-28 bg-white/5 rounded-none" /></td>
                    <td className="py-4"><div className="h-4 w-24 bg-white/5 rounded-none" /></td>
                    <td className="py-4"><div className="h-6 w-16 bg-white/5 rounded-none" /></td>
                    <td className="py-4"><div className="h-4 w-60 bg-white/5 rounded-none" /></td>
                    <td className="py-4 text-right pr-4"><div className="inline-block h-8 w-8 bg-white/5 rounded-none" /></td>
                  </tr>
                ))
              ) : displayedCases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No case records found matching the query.
                  </td>
                </tr>
              ) : (
                displayedCases.map((c) => (
                  <tr key={c?.id || Math.random()} className="hover:bg-white/[0.015] transition-all">
                    <td className="py-4 pl-4 font-mono font-bold text-white">{c?.fir_number || 'N/A'}</td>
                    <td className="py-4 text-xs text-slate-400">
                      {c?.date_reported ? new Date(c.date_reported).toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      }) : 'N/A'}
                    </td>
                    <td className="py-4 font-medium text-slate-200">{c?.district || 'N/A'}</td>
                    <td className="py-4">
                      <span className={`inline-block border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeClass(c?.status || 'Open')}`}>
                        {c?.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="py-4 max-w-xs truncate text-xs text-slate-400" title={c?.description || ''}>
                      {c?.description || <span className="italic text-slate-600">No notes provided</span>}
                    </td>
                    <td className="py-4 text-right pr-4">
                      <button
                        onClick={() => c?.id && handleDelete(c.id, c.fir_number)}
                        className="inline-grid h-8 w-8 place-items-center border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/25 transition-all cursor-pointer"
                        title="Delete Record"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between border-t border-white/8 mt-6 pt-4">
          <p className="text-xs text-slate-500">
            Viewing page <span className="font-semibold text-slate-300">{page}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={handlePrevPage}
              disabled={page === 1 || loading}
              className="flex h-8 w-8 items-center justify-center border border-white/10 bg-white/[0.02] text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 disabled:cursor-not-allowed cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNextPage}
              disabled={!hasMore || loading}
              className="flex h-8 w-8 items-center justify-center border border-white/10 bg-white/[0.02] text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 disabled:cursor-not-allowed cursor-pointer"
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>

      {/* Log Case Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050c0a]/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-none border border-white/10 bg-[#091713] shadow-2xl shadow-black/60">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
              <h2 className="font-display text-sm font-bold uppercase tracking-widest text-[#e2c979]">
                Log New Case File
              </h2>
              <button 
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* FIR Input */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <Tag size={12} className="text-[#c6a75b]" /> FIR Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BLR-2026-0042"
                  value={firNumber}
                  onChange={(e) => setFirNumber(e.target.value)}
                  className="w-full rounded-none border border-white/8 bg-white/[0.02] px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:border-[#c6a75b] focus:outline-none transition-all"
                />
              </div>

              {/* Date Reported Input */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <Calendar size={12} className="text-[#c6a75b]" /> Date/Time Reported <span className="text-red-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={dateReported}
                  onChange={(e) => setDateReported(e.target.value)}
                  className="w-full rounded-none border border-white/8 bg-white/[0.02] px-3.5 py-2.5 text-sm text-slate-200 focus:border-[#c6a75b] focus:outline-none transition-all"
                />
              </div>

              {/* District Input */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <MapPin size={12} className="text-[#c6a75b]" /> District Jurisdiction <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bengaluru City"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full rounded-none border border-white/8 bg-white/[0.02] px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:border-[#c6a75b] focus:outline-none transition-all"
                />
              </div>

              {/* Status Select */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <AlertCircle size={12} className="text-[#c6a75b]" /> Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-none border border-white/8 bg-[#0c211b] px-3.5 py-2.5 text-sm text-slate-200 focus:border-[#c6a75b] focus:outline-none transition-all"
                >
                  <option value="Open">Open (Active Investigation)</option>
                  <option value="Closed">Closed (Case Disposed)</option>
                  <option value="Cold">Cold (Inactive/Unresolved)</option>
                </select>
              </div>

              {/* Description Input */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <FileText size={12} className="text-[#c6a75b]" /> Modus Operandi & Case Description
                </label>
                <textarea
                  placeholder="Detailed notes on the case, modus operandi, suspects..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full rounded-none border border-white/8 bg-white/[0.02] px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:border-[#c6a75b] focus:outline-none transition-all resize-none"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 border-t border-white/8 pt-4 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={formSubmitting}
                  className="rounded-none border border-white/10 bg-white/[0.02] px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-50 cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="rounded-none bg-[#c6a75b] text-[#10231d] px-4 py-2.5 text-xs font-bold hover:bg-[#d8bb70] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {formSubmitting ? 'LOGGING...' : 'LOG RECORD'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      <UploadCaseModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
          setPage(1);
          setSearchQuery('');
          fetchCases();
        }}
      />
    </div>
  );
};

export default CaseLedger;
