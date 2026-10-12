import React, { useState } from 'react';
import { Student } from '../../types/assessment';
import { X, Upload, FileText, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

interface ImportStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (newStudents: Student[]) => void;
  currentClass: string;
}

export const ImportStudentModal: React.FC<ImportStudentModalProps> = ({
  isOpen,
  onClose,
  onImport,
  currentClass,
}) => {
  const [pasteData, setPasteData] = useState('');
  const [previewStudents, setPreviewStudents] = useState<Student[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const downloadSampleTemplate = () => {
    const headers = ['NISN', 'NIS', 'Nama Lengkap', 'Jenis Kelamin (L/P)', 'Kelas'];
    const sampleRows = [
      ['0091234501', '24101', 'Ahmad Rizky Pratama', 'L', currentClass],
      ['0091234502', '24102', 'Bella Safitri', 'P', currentClass],
      ['0091234503', '24103', 'Candra Wijaya', 'L', currentClass],
      ['0091234504', '24104', 'Dina Maulida', 'P', currentClass],
    ];
    exportToCSV(`Template_Daftar_Siswa_${currentClass}`, [headers, ...sampleRows]);
  };

  const parseText = (text: string) => {
    setErrorMessage(null);
    if (!text.trim()) {
      setPreviewStudents([]);
      return;
    }

    const lines = text.trim().split(/\r?\n/);
    const parsed: Student[] = [];

    // Check if line 1 is header
    let startIndex = 0;
    const firstLineLower = lines[0].toLowerCase();
    if (firstLineLower.includes('nisn') || firstLineLower.includes('nama') || firstLineLower.includes('nis')) {
      startIndex = 1;
    }

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Split by tab (if copied from Excel) or comma or semicolon
      let cols: string[] = [];
      if (line.includes('\t')) {
        cols = line.split('\t').map(c => c.trim().replace(/^"|"$/g, ''));
      } else if (line.includes(';')) {
        cols = line.split(';').map(c => c.trim().replace(/^"|"$/g, ''));
      } else {
        cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      }

      if (cols.length >= 2) {
        // Assume format could be:
        // Case 1: NISN, NIS, Nama, JK, Kelas
        // Case 2: No, NISN, Nama, JK...
        // Let's inspect columns flexibly:
        let nisn = '';
        let nis = '';
        let nama = '';
        let jk: 'L' | 'P' = 'L';
        let kls = currentClass;

        if (cols.length >= 4) {
          nisn = cols[0] || '';
          nis = cols[1] || '';
          nama = cols[2] || '';
          const jkRaw = (cols[3] || 'L').toUpperCase();
          jk = jkRaw.startsWith('P') ? 'P' : 'L';
          if (cols[4]) kls = cols[4];
        } else if (cols.length === 3) {
          nisn = cols[0] || '';
          nama = cols[1] || '';
          const jkRaw = (cols[2] || 'L').toUpperCase();
          jk = jkRaw.startsWith('P') ? 'P' : 'L';
          nis = nisn ? nisn.slice(-5) : '';
        } else if (cols.length === 2) {
          nisn = cols[0] || '';
          nama = cols[1] || '';
          nis = nisn.slice(-5);
        }

        if (nama) {
          parsed.push({
            id: 'std-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7) + '-' + i,
            nisn: nisn || '-',
            nis: nis || '-',
            nama: nama.trim(),
            jenisKelamin: jk,
            kelas: kls || currentClass,
            status: 'Aktif',
          });
        }
      }
    }

    if (parsed.length === 0) {
      setErrorMessage('Tidak ada data siswa yang valid terbaca. Pastikan format kolom: NISN, NIS, Nama Lengkap, Jenis Kelamin (L/P)');
    } else {
      setPreviewStudents(parsed);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setPasteData(content);
      parseText(content);
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = () => {
    if (previewStudents.length === 0) return;
    onImport(previewStudents);
    onClose();
    setPasteData('');
    setPreviewStudents([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs no-print">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Impor Daftar Siswa</h3>
              <p className="text-xs text-slate-500">Salin dari Excel atau unggah file CSV</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Action: Download Template */}
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2 text-slate-700">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Gunakan format standar untuk hasil terbaik:</span>
            </div>
            <button
              onClick={downloadSampleTemplate}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh Template CSV
            </button>
          </div>

          {/* Option A: Upload file */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Opsi 1: Unggah File CSV
            </label>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer border border-slate-200 rounded-xl p-1"
            />
          </div>

          {/* Option B: Copy Paste Excel */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Opsi 2: Salin (Copy-Paste) langsung dari Excel
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Urutan kolom: <strong>NISN</strong>, <strong>NIS</strong>, <strong>Nama Lengkap</strong>, <strong>L/P</strong>, <strong>Kelas</strong>
            </p>
            <textarea
              rows={4}
              value={pasteData}
              onChange={(e) => {
                setPasteData(e.target.value);
                parseText(e.target.value);
              }}
              placeholder="0091234501	24001	Ahmad Fauzan	L	VII A&#10;0091234502	24002	Bunga Citra	P	VII A"
              className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Error display */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Preview Table */}
          {previewStudents.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Pratinjau Hasil Impor ({previewStudents.length} Siswa Terdeteksi)
                </span>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 text-[11px] text-slate-600 font-bold sticky top-0">
                    <tr>
                      <th className="p-2">No</th>
                      <th className="p-2">NISN</th>
                      <th className="p-2">Nama Siswa</th>
                      <th className="p-2">L/P</th>
                      <th className="p-2">Kelas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewStudents.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="p-2 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="p-2 font-mono text-slate-600">{s.nisn}</td>
                        <td className="p-2 font-medium text-slate-900">{s.nama}</td>
                        <td className="p-2 text-slate-600">{s.jenisKelamin}</td>
                        <td className="p-2 text-slate-600">{s.kelas}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-end gap-2 bg-slate-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleImportSubmit}
            disabled={previewStudents.length === 0}
            className={`px-5 py-2 text-xs font-semibold rounded-xl text-white transition-all shadow-sm ${
              previewStudents.length > 0
                ? 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
                : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            Tambahkan {previewStudents.length > 0 ? `(${previewStudents.length} Siswa)` : ''} ke Daftar
          </button>
        </div>
      </div>
    </div>
  );
};
