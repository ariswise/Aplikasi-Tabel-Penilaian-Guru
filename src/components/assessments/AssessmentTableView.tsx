import React, { useState } from 'react';
import {
  AssessmentColumn,
  AssessmentScore,
  AssessmentType,
  SchoolProfile,
  Student,
} from '../../types/assessment';
import {
  calculateAverage,
  calculateHighest,
  calculateLowest,
  getPredicate,
  getStatusKetercapaian,
} from '../../utils/gradeCalculations';
import {
  Plus,
  Download,
  Printer,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Info,
  Calendar,
  BookOpen,
  Trash2,
  Edit3,
} from 'lucide-react';
import { AddAssessmentModal } from './AddAssessmentModal';
import { exportToCSV, printCurrentView } from '../../utils/exportUtils';
import { PrintHeader, PrintSignatureFooter } from '../layout/PrintHeader';

interface AssessmentTableViewProps {
  type: AssessmentType;
  title: string;
  subtitle: string;
  students: Student[];
  columns: AssessmentColumn[];
  scores: AssessmentScore[];
  profile: SchoolProfile;
  onUpdateScore: (studentId: string, columnId: string, nilai: number | null, catatan?: string) => void;
  onAddColumn: (column: AssessmentColumn) => void;
  onDeleteColumn: (columnId: string) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

export const AssessmentTableView: React.FC<AssessmentTableViewProps> = ({
  type,
  title,
  subtitle,
  students,
  columns,
  scores,
  profile,
  onUpdateScore,
  onAddColumn,
  onDeleteColumn,
  onShowToast,
}) => {
  // Filter columns belonging to this assessment type
  const typeColumns = columns.filter((col) => col.type === type);

  // Active selected column (or 'ALL' for matrix overview)
  const [selectedColumnId, setSelectedColumnId] = useState<string>(
    typeColumns[0]?.id || ''
  );

  // Sync if column was deleted or initial load
  const activeColumn = typeColumns.find((c) => c.id === selectedColumnId) || typeColumns[0];

  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'TERCAPAI' | 'REMEDIAL' | 'BELUM'>('ALL');
  const [columnToDelete, setColumnToDelete] = useState<AssessmentColumn | null>(null);

  // Helper to get score object
  const getScoreObj = (studentId: string, columnId: string): AssessmentScore | undefined => {
    return scores.find((s) => s.studentId === studentId && s.columnId === columnId);
  };

  // Value change handler with 0-100 validation
  const handleScoreChange = (studentId: string, columnId: string, valStr: string) => {
    if (valStr.trim() === '') {
      onUpdateScore(studentId, columnId, null);
      return;
    }

    const num = Number(valStr);
    if (isNaN(num)) return;

    if (num < 0 || num > 100) {
      onShowToast('Rentang Nilai Tidak Valid', 'Nilai harus berada dalam rentang 0 hingga 100.', 'error');
      return;
    }

    onUpdateScore(studentId, columnId, num);
  };

  const handleNotesChange = (studentId: string, columnId: string, notes: string) => {
    const existing = getScoreObj(studentId, columnId);
    onUpdateScore(studentId, columnId, existing?.nilai ?? null, notes);
  };

  // Quick preset remarks for teacher feedback
  const handleApplyPresetNote = (studentId: string, columnId: string, notePreset: string) => {
    const existing = getScoreObj(studentId, columnId);
    onUpdateScore(studentId, columnId, existing?.nilai ?? null, notePreset);
    onShowToast('Catatan Disimpan', 'Catatan guru berhasil diperbarui', 'info');
  };

  // Compute statistics for the active column
  const currentScoresList = students.map((std) => {
    if (!activeColumn) return null;
    const sc = getScoreObj(std.id, activeColumn.id);
    return sc?.nilai ?? null;
  });

  const validScores = currentScoresList.filter((s): s is number => s !== null && s !== undefined);
  const avgScore = calculateAverage(currentScoresList);
  const highestScore = calculateHighest(currentScoresList);
  const lowestScore = calculateLowest(currentScoresList);
  const gradedCount = validScores.length;
  const unGradedCount = students.length - gradedCount;
  const currentKktp = activeColumn?.kktpKhusus ?? profile.kktp;
  const passedCount = validScores.filter((s) => s >= currentKktp).length;
  const passPercentage = gradedCount > 0 ? Math.round((passedCount / gradedCount) * 100) : 0;

  // Filter students based on search and score status
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.nisn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.nis.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterStatus === 'ALL' || !activeColumn) return true;

    const sc = getScoreObj(student.id, activeColumn.id)?.nilai;
    if (filterStatus === 'BELUM') return sc === null || sc === undefined;
    if (filterStatus === 'TERCAPAI') return sc !== null && sc !== undefined && sc >= currentKktp;
    if (filterStatus === 'REMEDIAL') return sc !== null && sc !== undefined && sc < currentKktp;

    return true;
  });

  // Export current table view
  const handleExportTable = () => {
    if (!activeColumn) return;

    const headers = [
      'No',
      'NISN',
      'NIS',
      'Nama Siswa',
      'Kelas',
      'Tujuan Pembelajaran / Materi',
      'Tanggal Penilaian',
      'Nilai (0-100)',
      'Predikat',
      'Status Ketercapaian',
      'Catatan Guru / Umpan Balik',
    ];

    const rows = filteredStudents.map((std, idx) => {
      const sc = getScoreObj(std.id, activeColumn.id);
      const val = sc?.nilai ?? null;
      const pred = getPredicate(val, profile.rentangPredikat);
      const stat = getStatusKetercapaian(val, currentKktp);

      return [
        idx + 1,
        std.nisn,
        std.nis,
        std.nama,
        std.kelas,
        `${activeColumn.kode} - ${activeColumn.namaMateri}`,
        activeColumn.tanggal,
        val !== null ? val : 'Belum Dinilai',
        pred.predikat !== '-' ? `${pred.predikat} (${pred.label})` : 'Belum Dinilai',
        stat.status,
        sc?.catatan || '',
      ];
    });

    exportToCSV(`Tabel_${title.replace(/\s+/g, '_')}_${activeColumn.kode}`, [headers, ...rows]);
  };

  return (
    <div className="space-y-5">
      {/* Printable Letterhead & Metadata (Hidden on screen, visible during Print/PDF) */}
      <PrintHeader
        profile={profile}
        title={title}
        subtitle={
          activeColumn
            ? `${activeColumn.kode}: ${activeColumn.namaMateri} · Tanggal: ${activeColumn.tanggal}`
            : subtitle
        }
      />

      {/* Special Pedagogical Banner for Diagnostik */}
      {type === 'diagnostik' && (
        <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-2xl flex items-start gap-3 no-print">
          <Info className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
          <div className="text-xs text-indigo-900 leading-relaxed flex-1">
            <p className="font-bold text-indigo-950">
              Prinsip Penilaian Diagnostik (Asesmen Diagnostik Awal)
            </p>
            <p className="mt-0.5">
              Digunakan untuk memetakan kesiapan belajar, gaya belajar, dan minat peserta didik sebelum materi dimulai.
              Sesuai panduan Kurikulum Merdeka, <strong>nilai diagnostik TIDAK dimasukkan ke dalam Nilai Akhir (NA) Rapor</strong>,
              melainkan sebagai dasar diferensiasi pembelajaran guru.
            </p>
          </div>
        </div>
      )}

      {/* Assessment Column Tabs / Selector */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">{title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddColumnModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Materi / TP</span>
            </button>
          </div>
        </div>

        {/* Tab Buttons for Topics/Columns */}
        <div className="flex items-center gap-2 pt-3 overflow-x-auto pb-1 text-xs">
          {typeColumns.length === 0 ? (
            <div className="py-2 text-slate-500 italic">
              Belum ada materi atau TP untuk jenis penilaian ini. Klik <strong>Tambah Materi / TP</strong> di atas untuk membuat.
            </div>
          ) : (
            typeColumns.map((col) => {
              const isActive = (activeColumn?.id === col.id);
              return (
                <div key={col.id} className="relative group shrink-0">
                  <button
                    onClick={() => setSelectedColumnId(col.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border font-semibold transition-all text-xs ${
                      isActive
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-xs'
                        : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span>{col.kode}</span>
                    <span className="max-w-[140px] truncate font-normal text-slate-500">
                      {col.namaMateri}
                    </span>
                  </button>

                  {/* Delete column button */}
                  {typeColumns.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setColumnToDelete(col);
                      }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-xs"
                      title="Hapus Kolom Asesmen Ini"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {activeColumn && (
        <>
          {/* Active Column Details & Statistical Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 no-print">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">Rata-Rata</span>
              <div className="text-xl font-bold font-mono text-indigo-700 mt-1">
                {avgScore !== null ? avgScore : '—'}
              </div>
              <span className="text-[10px] text-slate-400">Target KKTP: {currentKktp}</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">Tertinggi</span>
              <div className="text-xl font-bold font-mono text-emerald-600 mt-1">
                {highestScore !== null ? highestScore : '—'}
              </div>
              <span className="text-[10px] text-slate-400">Skor maksimal</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">Terendah</span>
              <div className="text-xl font-bold font-mono text-rose-600 mt-1">
                {lowestScore !== null ? lowestScore : '—'}
              </div>
              <span className="text-[10px] text-slate-400">Skor minimum</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">Sudah Dinilai</span>
              <div className="text-xl font-bold font-mono text-slate-800 mt-1">
                {gradedCount} <span className="text-xs font-normal text-slate-400">/ {students.length}</span>
              </div>
              <span className="text-[10px] text-slate-400">
                {students.length > 0 ? Math.round((gradedCount / students.length) * 100) : 0}% selesai
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">Belum Dinilai</span>
              <div className="text-xl font-bold font-mono text-amber-600 mt-1">
                {unGradedCount}
              </div>
              <span className="text-[10px] text-slate-400">Perlu diisi guru</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">Ketuntasan</span>
              <div className="text-xl font-bold font-mono text-emerald-600 mt-1">
                {passPercentage}%
              </div>
              <span className="text-[10px] text-slate-400">{passedCount} siswa tuntas</span>
            </div>
          </div>

          {/* Active Topic Description Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded font-bold bg-indigo-100 text-indigo-800 text-[11px]">
                  {activeColumn.kode}
                </span>
                <span className="font-semibold text-slate-900">{activeColumn.namaMateri}</span>
                {activeColumn.jenisDiagnostik && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                    {activeColumn.jenisDiagnostik}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-slate-500 text-[11px]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Tanggal: {activeColumn.tanggal}
                </span>
                {activeColumn.keterangan && (
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    Instrumen: {activeColumn.keterangan}
                  </span>
                )}
              </div>
            </div>

            {/* Filter & Export Toolbar */}
            <div className="flex items-center gap-2 no-print flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari siswa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg w-40 sm:w-48 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="py-1.5 px-2.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 font-medium"
              >
                <option value="ALL">Semua Status</option>
                <option value="TERCAPAI">Tercapai (≥ KKTP)</option>
                <option value="REMEDIAL">Perlu Remedial (&lt; KKTP)</option>
                <option value="BELUM">Belum Dinilai</option>
              </select>

              {/* Export to CSV */}
              <button
                onClick={handleExportTable}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                title="Ekspor Data Nilai ke Excel/CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Excel</span>
              </button>

              {/* Print View */}
              <button
                onClick={() => printCurrentView(`${title} ${activeColumn.kode} - ${profile.namaSekolah}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                title="Cetak Tabel Resmi"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak</span>
              </button>
            </div>
          </div>

          {/* MAIN ASSESSMENT TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs print-table">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-3 w-12 text-center">No</th>
                    <th className="py-3 px-3 w-28">NISN</th>
                    <th className="py-3 px-3">Nama Siswa</th>
                    <th className="py-3 px-3 w-32 text-center">
                      Nilai (0–100)
                    </th>
                    <th className="py-3 px-3 w-28 text-center">Predikat</th>
                    <th className="py-3 px-3 w-36 text-center">Ketercapaian</th>
                    <th className="py-3 px-3 min-w-[220px]">
                      Catatan Guru / Umpan Balik
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-600 text-sm">Tidak ada siswa sesuai filter</p>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student, idx) => {
                      const sc = getScoreObj(student.id, activeColumn.id);
                      const currentVal = sc?.nilai ?? null;
                      const pred = getPredicate(currentVal, profile.rentangPredikat);
                      const status = getStatusKetercapaian(currentVal, currentKktp);

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">
                            {student.nisn || '-'}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {student.nama}
                          </td>

                          {/* Nilai Input (Inline Edit with strict 0-100 validation and "Belum Dinilai" state) */}
                          <td className="py-2.5 px-3 text-center">
                            <div className="inline-block relative">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                step="1"
                                placeholder="Belum"
                                value={currentVal !== null ? currentVal : ''}
                                onChange={(e) =>
                                  handleScoreChange(student.id, activeColumn.id, e.target.value)
                                }
                                className={`w-20 py-1.5 px-2 text-center font-mono font-bold text-xs rounded-lg border transition-all ${
                                  currentVal === null
                                    ? 'bg-slate-50 border-dashed border-slate-300 text-slate-400 placeholder:text-slate-400 placeholder:italic placeholder:font-normal'
                                    : currentVal >= currentKktp
                                    ? 'bg-emerald-50/50 border-emerald-300 text-emerald-800'
                                    : 'bg-rose-50/50 border-rose-300 text-rose-800'
                                } focus:ring-2 focus:ring-indigo-500 focus:outline-hidden`}
                              />
                            </div>
                          </td>

                          {/* Predikat */}
                          <td className="py-2.5 px-3 text-center">
                            {pred.predikat !== '-' ? (
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-md font-bold text-[11px] border ${pred.color}`}
                              >
                                {pred.predikat} <span className="font-normal text-[10px]">({pred.label})</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">
                                Belum Dinilai
                              </span>
                            )}
                          </td>

                          {/* Ketercapaian */}
                          <td className="py-2.5 px-3 text-center">
                            {status.status === 'Tercapai' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Tercapai</span>
                              </span>
                            )}
                            {status.status === 'Perlu Remedial' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                <AlertCircle className="w-3 h-3" />
                                <span>Perlu Remedial</span>
                              </span>
                            )}
                            {status.status === 'Belum Dinilai' && (
                              <span className="text-slate-400 text-[11px] italic">
                                Belum Dinilai
                              </span>
                            )}
                          </td>

                          {/* Catatan Guru */}
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                placeholder="Tulis umpan balik guru..."
                                value={sc?.catatan || ''}
                                onChange={(e) =>
                                  handleNotesChange(student.id, activeColumn.id, e.target.value)
                                }
                                className="w-full py-1 px-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400"
                              />

                              {/* Quick Note Presets Dropdown */}
                              <div className="relative group shrink-0 no-print">
                                <button
                                  type="button"
                                  className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100 transition-colors"
                                  title="Pilih Template Catatan Cepat"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                </button>
                                <div className="absolute right-0 top-full mt-1 hidden group-hover:block w-56 bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-20 text-[11px]">
                                  <p className="px-2 py-1 font-bold text-slate-400 uppercase text-[9px]">
                                    Template Umpan Balik:
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleApplyPresetNote(
                                        student.id,
                                        activeColumn.id,
                                        'Menunjukkan pemahaman konsep yang sangat baik dan mandiri.'
                                      )
                                    }
                                    className="w-full text-left px-2 py-1 hover:bg-indigo-50 hover:text-indigo-700 rounded text-slate-700 truncate"
                                  >
                                    Penguasaan Sangat Baik
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleApplyPresetNote(
                                        student.id,
                                        activeColumn.id,
                                        'Telah mencapai kriteria ketercapaian dengan konsisten.'
                                      )
                                    }
                                    className="w-full text-left px-2 py-1 hover:bg-indigo-50 hover:text-indigo-700 rounded text-slate-700 truncate"
                                  >
                                    Tuntas Sesuai Kriteria
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleApplyPresetNote(
                                        student.id,
                                        activeColumn.id,
                                        'Perlu bimbingan dan latihan tambahan pada indikator ini.'
                                      )
                                    }
                                    className="w-full text-left px-2 py-1 hover:bg-rose-50 hover:text-rose-700 rounded text-slate-700 truncate"
                                  >
                                    Perlu Remedial / Bimbingan
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Official Signatures (Printed only) */}
      <PrintSignatureFooter profile={profile} />

      {/* Modal Add Column */}
      <AddAssessmentModal
        isOpen={isAddColumnModalOpen}
        onClose={() => setIsAddColumnModalOpen(false)}
        type={type}
        existingCount={typeColumns.length}
        onAddColumn={(newCol) => {
          onAddColumn(newCol);
          setSelectedColumnId(newCol.id);
          onShowToast('Kolom Berhasil Ditambahkan', `Materi ${newCol.kode} telah ditambahkan ke tabel.`);
        }}
      />

      {/* Confirm Delete Column Modal */}
      {columnToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs no-print text-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900">Hapus Kolom Penilaian?</h4>
            <p className="text-slate-600 mt-1">
              Apakah Anda yakin ingin menghapus kolom <strong>{columnToDelete.kode}: {columnToDelete.namaMateri}</strong>? Semua nilai siswa pada kolom ini akan dihapus.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setColumnToDelete(null)}
                className="px-3.5 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteColumn(columnToDelete.id);
                  setColumnToDelete(null);
                  onShowToast('Kolom Dihapus', 'Kolom penilaian berhasil dihapus.');
                }}
                className="px-4 py-1.5 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700"
              >
                Hapus Kolom
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
