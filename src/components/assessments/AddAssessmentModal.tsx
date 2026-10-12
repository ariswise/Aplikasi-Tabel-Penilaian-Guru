import React, { useState } from 'react';
import { AssessmentColumn, AssessmentType } from '../../types/assessment';
import { X, Plus, Calendar, Tag, BookOpen } from 'lucide-react';

interface AddAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: AssessmentType;
  onAddColumn: (column: AssessmentColumn) => void;
  existingCount: number;
}

export const AddAssessmentModal: React.FC<AddAssessmentModalProps> = ({
  isOpen,
  onClose,
  type,
  onAddColumn,
  existingCount,
}) => {
  const getDefaultKode = (t: AssessmentType, count: number): string => {
    switch (t) {
      case 'diagnostik':
        return `DIAG-${count + 1}`;
      case 'formatif':
        return `TP ${count + 1}`;
      case 'sumatif_materi':
        return `SUM-${count + 1}`;
      case 'sts':
        return `STS-${count + 1}`;
      case 'sas':
        return `SAS-${count + 1}`;
    }
  };

  const [kode, setKode] = useState(getDefaultKode(type, existingCount));
  const [namaMateri, setNamaMateri] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [jenisDiagnostik, setJenisDiagnostik] = useState<'Kognitif' | 'Non-Kognitif'>('Kognitif');
  const [keterangan, setKeterangan] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaMateri.trim()) return;

    const newColumn: AssessmentColumn = {
      id: `col-${type}-${Date.now()}`,
      type,
      kode: kode.trim() || getDefaultKode(type, existingCount),
      namaMateri: namaMateri.trim(),
      tanggal,
      jenisDiagnostik: type === 'diagnostik' ? jenisDiagnostik : undefined,
      keterangan: keterangan.trim(),
    };

    onAddColumn(newColumn);
    onClose();
    setNamaMateri('');
    setKeterangan('');
  };

  const getModalTitle = () => {
    switch (type) {
      case 'diagnostik':
        return 'Tambah Asesmen Diagnostik Awal';
      case 'formatif':
        return 'Tambah Penilaian Formatif (Tujuan Pembelajaran / TP)';
      case 'sumatif_materi':
        return 'Tambah Sumatif Akhir Lingkup Materi';
      case 'sts':
        return 'Tambah Sumatif Tengah Semester (STS)';
      case 'sas':
        return 'Tambah Sumatif Akhir Semester (SAS)';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs no-print">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden text-xs">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{getModalTitle()}</h3>
              <p className="text-[11px] text-slate-500">Buat kolom asesmen baru untuk seluruh siswa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>Kode / TP / Label</span>
              </label>
              <input
                type="text"
                required
                value={kode}
                onChange={(e) => setKode(e.target.value)}
                placeholder="Contoh: TP 1.1 / SUM-1"
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Tanggal Penilaian</span>
              </label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {type === 'diagnostik' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kategori Asesmen Diagnostik
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setJenisDiagnostik('Kognitif')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    jenisDiagnostik === 'Kognitif'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Kognitif (Materi Awal)
                </button>
                <button
                  type="button"
                  onClick={() => setJenisDiagnostik('Non-Kognitif')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    jenisDiagnostik === 'Non-Kognitif'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Non-Kognitif (Gaya/Minat)
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>Tujuan Pembelajaran / Materi yang Dinilai <span className="text-rose-500">*</span></span>
            </label>
            <textarea
              required
              rows={2}
              value={namaMateri}
              onChange={(e) => setNamaMateri(e.target.value)}
              placeholder="Contoh: Mengidentifikasi bagian mikroskop dan fungsinya dalam pengamatan sel"
              className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Bentuk Instrumen / Catatan Penilaian (Opsional)
            </label>
            <input
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Contoh: Tes tertulis / Rubrik unjuk kerja praktikum"
              className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Simpan & Buat Kolom</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
