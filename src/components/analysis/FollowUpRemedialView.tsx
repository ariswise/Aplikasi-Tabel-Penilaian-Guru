import React, { useState } from 'react';
import {
  AssessmentColumn,
  AssessmentScore,
  SchoolProfile,
  Student,
} from '../../types/assessment';
import {
  Award,
  AlertCircle,
  CheckCircle2,
  Printer,
  Download,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { exportToCSV, printCurrentView } from '../../utils/exportUtils';
import { PrintHeader, PrintSignatureFooter } from '../layout/PrintHeader';

interface FollowUpRemedialViewProps {
  students: Student[];
  columns: AssessmentColumn[];
  scores: AssessmentScore[];
  profile: SchoolProfile;
  onUpdateScore: (studentId: string, columnId: string, nilai: number | null, catatan?: string) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

export const FollowUpRemedialView: React.FC<FollowUpRemedialViewProps> = ({
  students,
  columns,
  scores,
  profile,
  onUpdateScore,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'remedial' | 'pengayaan'>('remedial');
  const [filterColumnId, setFilterColumnId] = useState<string>('ALL');

  // Academic columns (Formatif & Sumatif Materi)
  const targetColumns = columns.filter((c) => c.type === 'formatif' || c.type === 'sumatif_materi');

  // Build remedial candidate items
  const remedialItems: {
    student: Student;
    column: AssessmentColumn;
    originalScore: number;
    scoreObj: AssessmentScore;
  }[] = [];

  // Build enrichment candidate items (high scores >= 85)
  const enrichmentItems: {
    student: Student;
    column: AssessmentColumn;
    score: number;
    scoreObj: AssessmentScore;
  }[] = [];

  students.forEach((std) => {
    targetColumns.forEach((col) => {
      const sc = scores.find((s) => s.studentId === std.id && s.columnId === col.id);
      const val = sc?.nilai;
      const kktp = col.kktpKhusus ?? profile.kktp;

      if (val !== null && val !== undefined) {
        if (val < kktp) {
          remedialItems.push({
            student: std,
            column: col,
            originalScore: val,
            scoreObj: sc!,
          });
        } else if (val >= 88) {
          enrichmentItems.push({
            student: std,
            column: col,
            score: val,
            scoreObj: sc!,
          });
        }
      }
    });
  });

  const filteredRemedial = remedialItems.filter((item) => {
    if (filterColumnId === 'ALL') return true;
    return item.column.id === filterColumnId;
  });

  const filteredEnrichment = enrichmentItems.filter((item) => {
    if (filterColumnId === 'ALL') return true;
    return item.column.id === filterColumnId;
  });

  const handleUpdateRemedialScore = (
    studentId: string,
    columnId: string,
    newScoreStr: string
  ) => {
    if (!newScoreStr.trim()) return;
    const num = Number(newScoreStr);
    if (isNaN(num) || num < 0 || num > 100) {
      onShowToast('Nilai Tidak Valid', 'Nilai remedial harus antara 0 hingga 100.', 'error');
      return;
    }

    // Set updated score and note
    onUpdateScore(
      studentId,
      columnId,
      num,
      `Tuntas setelah remedial (Nilai perbaikan: ${num})`
    );
    onShowToast('Nilai Remedial Disimpan', 'Nilai peserta didik berhasil diperbarui.');
  };

  const handleExportRemedial = () => {
    const headers = [
      'No',
      'NISN',
      'Nama Siswa',
      'Kode TP/Materi',
      'Materi yang Perlu Perbaikan',
      'KKTP',
      'Nilai Awal',
      'Bentuk Kegiatan Remedial',
      'Catatan Guru',
    ];

    const rows = filteredRemedial.map((item, idx) => [
      idx + 1,
      item.student.nisn,
      item.student.nama,
      item.column.kode,
      item.column.namaMateri,
      profile.kktp,
      item.originalScore,
      'Penugasan ulang / Bimbingan belajar perorangan',
      item.scoreObj.catatan || 'Perlu bimbingan',
    ]);

    exportToCSV(`Daftar_Tindak_Lanjut_Remedial_${profile.kelas}`, [headers, ...rows]);
  };

  return (
    <div className="space-y-5">
      {/* Printable Header */}
      <PrintHeader
        profile={profile}
        title={
          activeTab === 'remedial'
            ? 'PROGRAM DAN DAFTAR TINDAK LANJUT REMEDIAL'
            : 'PROGRAM DAN DAFTAR TINDAK LANJUT PENGAYAAN'
        }
        subtitle={`Kriteria Ketercapaian Tujuan Pembelajaran (KKTP): ${profile.kktp}`}
      />

      {/* Segmented Tab Switcher */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs no-print">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('remedial')}
            className={`flex items-center gap-2 px-4 py-2 font-bold rounded-lg transition-all ${
              activeTab === 'remedial'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>Program Remedial ({remedialItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pengayaan')}
            className={`flex items-center gap-2 px-4 py-2 font-bold rounded-lg transition-all ${
              activeTab === 'pengayaan'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Program Pengayaan ({enrichmentItems.length})</span>
          </button>
        </div>

        {/* Filter by Topic/Column & Export buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <select
            value={filterColumnId}
            onChange={(e) => setFilterColumnId(e.target.value)}
            className="p-2 border border-slate-200 rounded-xl bg-white font-medium text-slate-700 text-xs"
          >
            <option value="ALL">Semua Materi / TP</option>
            {targetColumns.map((col) => (
              <option key={col.id} value={col.id}>
                {col.kode} - {col.namaMateri.slice(0, 30)}...
              </option>
            ))}
          </select>

          <button
            onClick={handleExportRemedial}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>

          <button
            onClick={() => printCurrentView(`Tindak Lanjut ${activeTab} ${profile.kelas}`)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Form</span>
          </button>
        </div>
      </div>

      {/* TAB 1: REMEDIAL CONTENT */}
      {activeTab === 'remedial' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-rose-50/60 border-b border-rose-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-rose-900">
                Daftar Peserta Didik Memerlukan Remedial (Nilai &lt; KKTP {profile.kktp})
              </h3>
              <p className="text-[11px] text-rose-700 mt-0.5">
                Guru dapat memberikan pendampingan materi dan menginput nilai hasil ujian perbaikan di kolom input berikut.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-rose-100 text-rose-800 px-2.5 py-1 rounded-lg">
              {filteredRemedial.length} Kasus Remedial
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs print-table">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3 w-12 text-center">No</th>
                  <th className="p-3 w-28">NISN</th>
                  <th className="p-3">Nama Siswa</th>
                  <th className="p-3 w-24">Kode TP</th>
                  <th className="p-3">Materi yang Belum Tuntas</th>
                  <th className="p-3 w-24 text-center">Nilai Awal</th>
                  <th className="p-3 w-32 text-center no-print">Nilai Remedial</th>
                  <th className="p-3">Bentuk Kegiatan Remedial</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRemedial.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-slate-400">
                      <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
                      <p className="font-semibold text-slate-700 text-sm">Luar Biasa! Tidak ada siswa yang perlu remedial.</p>
                      <p className="text-xs text-slate-400 mt-0.5">Seluruh peserta didik telah melampaui KKTP {profile.kktp}.</p>
                    </td>
                  </tr>
                ) : (
                  filteredRemedial.map((item, idx) => (
                    <tr key={`${item.student.id}-${item.column.id}`} className="hover:bg-slate-50">
                      <td className="p-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="p-3 font-mono text-slate-600 text-[11px]">{item.student.nisn || '-'}</td>
                      <td className="p-3 font-semibold text-slate-900">{item.student.nama}</td>
                      <td className="p-3 font-mono font-bold text-indigo-700">{item.column.kode}</td>
                      <td className="p-3 text-slate-800">{item.column.namaMateri}</td>
                      <td className="p-3 text-center font-mono font-bold text-rose-600 bg-rose-50/50">
                        {item.originalScore}
                      </td>

                      {/* Input Nilai Remedial */}
                      <td className="p-3 text-center no-print">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          placeholder="Nilai baru..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleUpdateRemedialScore(
                                item.student.id,
                                item.column.id,
                                (e.target as HTMLInputElement).value
                              );
                            }
                          }}
                          onBlur={(e) => {
                            if (e.target.value) {
                              handleUpdateRemedialScore(
                                item.student.id,
                                item.column.id,
                                e.target.value
                              );
                            }
                          }}
                          className="w-24 p-1.5 text-center font-mono font-bold text-xs border border-indigo-300 rounded-lg bg-indigo-50/30 focus:ring-2 focus:ring-indigo-500"
                        />
                      </td>

                      <td className="p-3 text-slate-600 italic">
                        Bimbingan tutor perorangan & tes perbaikan indikator
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PENGAYAAN CONTENT */}
      {activeTab === 'pengayaan' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-emerald-50/60 border-b border-emerald-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-emerald-900">
                Daftar Peserta Didik Program Pengayaan (Pencapaian Sangat Tinggi ≥ 88)
              </h3>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Peserta didik dengan kompetensi unggul yang direkomendasikan untuk tugas pengayaan, proyek eksplorasi, atau tutor sebaya.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg">
              {filteredEnrichment.length} Peserta Didik
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs print-table">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3 w-12 text-center">No</th>
                  <th className="p-3 w-28">NISN</th>
                  <th className="p-3">Nama Siswa</th>
                  <th className="p-3 w-24">Kode TP</th>
                  <th className="p-3">Materi Unggul</th>
                  <th className="p-3 w-24 text-center">Nilai Capaian</th>
                  <th className="p-3">Rencana Kegiatan Pengayaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEnrichment.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-400">
                      Belum ada siswa dengan nilai kategori pengayaan (≥ 88) pada materi yang dipilih.
                    </td>
                  </tr>
                ) : (
                  filteredEnrichment.map((item, idx) => (
                    <tr key={`${item.student.id}-${item.column.id}`} className="hover:bg-slate-50">
                      <td className="p-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="p-3 font-mono text-slate-600 text-[11px]">{item.student.nisn || '-'}</td>
                      <td className="p-3 font-semibold text-slate-900">{item.student.nama}</td>
                      <td className="p-3 font-mono font-bold text-indigo-700">{item.column.kode}</td>
                      <td className="p-3 text-slate-800">{item.column.namaMateri}</td>
                      <td className="p-3 text-center font-mono font-bold text-emerald-700 bg-emerald-50/50">
                        {item.score}
                      </td>
                      <td className="p-3 text-slate-700">
                        Penugasan proyek kontekstual mandiri & peran sebagai tutor sebaya bagi kelompok
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Official Signatures for Follow Up Print */}
      <PrintSignatureFooter profile={profile} />
    </div>
  );
};
