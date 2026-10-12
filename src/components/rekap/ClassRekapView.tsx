import React, { useState } from 'react';
import {
  AssessmentColumn,
  AssessmentScore,
  AssessmentWeight,
  FinalGradeSummary,
  SchoolProfile,
  Student,
} from '../../types/assessment';
import {
  calculateAverage,
  calculateFinalScore,
  calculateHighest,
  calculateLowest,
  getPredicate,
} from '../../utils/gradeCalculations';
import {
  Download,
  Printer,
  Search,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Info,
} from 'lucide-react';
import { exportToCSV, printCurrentView } from '../../utils/exportUtils';
import { PrintHeader, PrintSignatureFooter } from '../layout/PrintHeader';

interface ClassRekapViewProps {
  students: Student[];
  columns: AssessmentColumn[];
  scores: AssessmentScore[];
  profile: SchoolProfile;
  weights: AssessmentWeight;
  onUpdateWeights: (weights: AssessmentWeight) => void;
  onSelectStudentDetail: (studentId: string) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

export const ClassRekapView: React.FC<ClassRekapViewProps> = ({
  students,
  columns,
  scores,
  profile,
  weights,
  onUpdateWeights,
  onSelectStudentDetail,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'TUNTAS' | 'BELUM_TUNTAS' | 'BELUM_LENGKAP'>('ALL');
  const [showWeightEditor, setShowWeightEditor] = useState(false);
  const [editWeights, setEditWeights] = useState<AssessmentWeight>(weights);

  // Group columns by type
  const formatifCols = columns.filter((c) => c.type === 'formatif');
  const sumatifMateriCols = columns.filter((c) => c.type === 'sumatif_materi');
  const stsCols = columns.filter((c) => c.type === 'sts');
  const sasCols = columns.filter((c) => c.type === 'sas');

  // Helper to extract student average/latest score for column group
  const computeStudentSummary = (student: Student): FinalGradeSummary => {
    // 1. Formatif Average
    const formatifScores = formatifCols.map((col) => {
      const sc = scores.find((s) => s.studentId === student.id && s.columnId === col.id);
      return sc?.nilai ?? null;
    });
    const rataFormatif = calculateAverage(formatifScores);

    // 2. Sumatif Materi Average
    const sumatifScores = sumatifMateriCols.map((col) => {
      const sc = scores.find((s) => s.studentId === student.id && s.columnId === col.id);
      return sc?.nilai ?? null;
    });
    const rataSumatifMateri = calculateAverage(sumatifScores);

    // 3. STS (Average if multiple, or single)
    const stsScores = stsCols.map((col) => {
      const sc = scores.find((s) => s.studentId === student.id && s.columnId === col.id);
      return sc?.nilai ?? null;
    });
    const nilaiSTS = calculateAverage(stsScores);

    // 4. SAS (Average if multiple, or single)
    const sasScores = sasCols.map((col) => {
      const sc = scores.find((s) => s.studentId === student.id && s.columnId === col.id);
      return sc?.nilai ?? null;
    });
    const nilaiSAS = calculateAverage(sasScores);

    // 5. Final Grade NA (strictly ignores diagnostic)
    const nilaiAkhir = calculateFinalScore(
      rataFormatif,
      rataSumatifMateri,
      nilaiSTS,
      nilaiSAS,
      weights
    );

    const predObj = getPredicate(nilaiAkhir, profile.rentangPredikat);
    const predikat = predObj.predikat;

    let status: 'Tuntas' | 'Belum Tuntas' | 'Belum Lengkap' = 'Belum Lengkap';
    if (nilaiAkhir !== null) {
      status = nilaiAkhir >= profile.kktp ? 'Tuntas' : 'Belum Tuntas';
    }

    return {
      student,
      rataFormatif,
      rataSumatifMateri,
      nilaiSTS,
      nilaiSAS,
      nilaiAkhir,
      predikat,
      status,
    };
  };

  const studentSummaries = students.map(computeStudentSummary);

  // Overall class averages for each assessment pillar
  const classAvgFormatif = calculateAverage(studentSummaries.map((s) => s.rataFormatif));
  const classAvgSumatifMateri = calculateAverage(studentSummaries.map((s) => s.rataSumatifMateri));
  const classAvgSTS = calculateAverage(studentSummaries.map((s) => s.nilaiSTS));
  const classAvgSAS = calculateAverage(studentSummaries.map((s) => s.nilaiSAS));
  const classAvgFinal = calculateAverage(studentSummaries.map((s) => s.nilaiAkhir));

  const totalTuntas = studentSummaries.filter((s) => s.status === 'Tuntas').length;
  const totalBelumTuntas = studentSummaries.filter((s) => s.status === 'Belum Tuntas').length;
  const totalBelumLengkap = studentSummaries.filter((s) => s.status === 'Belum Lengkap').length;

  const handleSaveWeights = (e: React.FormEvent) => {
    e.preventDefault();
    const sum =
      Number(editWeights.formatif) +
      Number(editWeights.sumatifMateri) +
      Number(editWeights.sts) +
      Number(editWeights.sas);

    if (sum !== 100) {
      onShowToast(
        'Total Bobot Harus 100%',
        `Saat ini total bobot adalah ${sum}%. Sesuaikan agar pas 100%.`,
        'error'
      );
      return;
    }

    onUpdateWeights(editWeights);
    setShowWeightEditor(false);
    onShowToast('Bobot Penilaian Disimpan', 'Formula Nilai Akhir telah disesuaikan.');
  };

  const handleExportLedger = () => {
    const headers = [
      'No',
      'NISN',
      'NIS',
      'Nama Siswa',
      'Kelas',
      `Rata Formatif (${weights.formatif}%)`,
      `Rata Sumatif Materi (${weights.sumatifMateri}%)`,
      `STS (${weights.sts}%)`,
      `SAS (${weights.sas}%)`,
      'Nilai Akhir (NA)',
      'Predikat',
      'Keterangan Status',
    ];

    const rows = filteredSummaries.map((s, idx) => [
      idx + 1,
      s.student.nisn,
      s.student.nis,
      s.student.nama,
      s.student.kelas,
      s.rataFormatif !== null ? s.rataFormatif : 'Belum Dinilai',
      s.rataSumatifMateri !== null ? s.rataSumatifMateri : 'Belum Dinilai',
      s.nilaiSTS !== null ? s.nilaiSTS : 'Belum Dinilai',
      s.nilaiSAS !== null ? s.nilaiSAS : 'Belum Dinilai',
      s.nilaiAkhir !== null ? s.nilaiAkhir : 'Belum Lengkap',
      s.predikat,
      s.status,
    ]);

    exportToCSV(`Ledger_Rekap_Nilai_Kelas_${profile.kelas}`, [headers, ...rows]);
  };

  const filteredSummaries = studentSummaries.filter((s) => {
    const matchSearch =
      s.student.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student.nisn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student.nis.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'TUNTAS') return s.status === 'Tuntas';
    if (filterStatus === 'BELUM_TUNTAS') return s.status === 'Belum Tuntas';
    if (filterStatus === 'BELUM_LENGKAP') return s.status === 'Belum Lengkap';
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Printable Header */}
      <PrintHeader
        profile={profile}
        title="REKAPITULASI HASIL PENILAIAN SISWA (LEDGER RAPOR)"
        subtitle={`Komposisi Bobot: Formatif ${weights.formatif}%, Sumatif Materi ${weights.sumatifMateri}%, STS ${weights.sts}%, SAS ${weights.sas}%`}
      />

      {/* Summary Statistical Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 no-print">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rata-Rata Nilai Akhir</p>
          <h3 className="text-2xl font-bold font-mono text-indigo-700 mt-1">
            {classAvgFinal !== null ? classAvgFinal : '—'}
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">KKTP Sekolah: {profile.kktp}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Siswa Tuntas</p>
          <h3 className="text-2xl font-bold font-mono text-emerald-600 mt-1">{totalTuntas}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {students.length ? Math.round((totalTuntas / students.length) * 100) : 0}% tuntas belajar
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Perlu Remedial</p>
          <h3 className="text-2xl font-bold font-mono text-rose-600 mt-1">{totalBelumTuntas}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Nilai di bawah KKTP</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nilai Belum Lengkap</p>
          <h3 className="text-2xl font-bold font-mono text-amber-600 mt-1">{totalBelumLengkap}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Komponen masih kosong</p>
        </div>
      </div>

      {/* Toolbar & Weight Info */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs no-print">
        {/* Search & Status filter */}
        <div className="flex items-center gap-2 flex-1">
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari siswa di ledger..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="py-1.5 px-3 border border-slate-200 rounded-xl bg-white font-medium text-slate-700"
          >
            <option value="ALL">Semua Siswa</option>
            <option value="TUNTAS">Tuntas (≥ KKTP)</option>
            <option value="BELUM_TUNTAS">Belum Tuntas (&lt; KKTP)</option>
            <option value="BELUM_LENGKAP">Belum Lengkap</option>
          </select>
        </div>

        {/* Buttons: Adjust Weights, Export, Print */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setEditWeights(weights);
              setShowWeightEditor(!showWeightEditor);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Atur Bobot Penilaian</span>
          </button>

          <button
            onClick={handleExportLedger}
            className="flex items-center gap-1.5 px-3 py-1.5 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            title="Ekspor Ledger ke CSV/Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>

          <button
            onClick={() => printCurrentView(`Ledger Rekap Nilai ${profile.kelas} - ${profile.namaSekolah}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            title="Cetak Ledger Rapor Resmi"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Ledger</span>
          </button>
        </div>
      </div>

      {/* Weight Editor Collapsible Form */}
      {showWeightEditor && (
        <form
          onSubmit={handleSaveWeights}
          className="p-5 bg-indigo-50/60 border border-indigo-200 rounded-2xl space-y-3 no-print text-xs"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-indigo-950 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Pengaturan Persentase Bobot Nilai Akhir (NA)</span>
            </h4>
            <span className="text-[11px] text-indigo-700 font-medium">
              *Nilai Diagnostik tidak diikutsertakan dalam Nilai Akhir Rapor
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Formatif (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={editWeights.formatif}
                onChange={(e) =>
                  setEditWeights({ ...editWeights, formatif: Number(e.target.value) })
                }
                className="w-full p-2 border border-slate-300 rounded-xl font-bold font-mono bg-white"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Sumatif Materi (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={editWeights.sumatifMateri}
                onChange={(e) =>
                  setEditWeights({ ...editWeights, sumatifMateri: Number(e.target.value) })
                }
                className="w-full p-2 border border-slate-300 rounded-xl font-bold font-mono bg-white"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                STS (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={editWeights.sts}
                onChange={(e) =>
                  setEditWeights({ ...editWeights, sts: Number(e.target.value) })
                }
                className="w-full p-2 border border-slate-300 rounded-xl font-bold font-mono bg-white"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                SAS (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={editWeights.sas}
                onChange={(e) =>
                  setEditWeights({ ...editWeights, sas: Number(e.target.value) })
                }
                className="w-full p-2 border border-slate-300 rounded-xl font-bold font-mono bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-slate-600 font-semibold">
              Total Bobot:{' '}
              <strong
                className={
                  Number(editWeights.formatif) +
                    Number(editWeights.sumatifMateri) +
                    Number(editWeights.sts) +
                    Number(editWeights.sas) ===
                  100
                    ? 'text-emerald-700'
                    : 'text-rose-600'
                }
              >
                {Number(editWeights.formatif) +
                  Number(editWeights.sumatifMateri) +
                  Number(editWeights.sts) +
                  Number(editWeights.sas)}
                %
              </strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowWeightEditor(false)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded-xl font-medium"
              >
                Tutup
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
              >
                Simpan Bobot
              </button>
            </div>
          </div>
        </form>
      )}

      {/* LEDGER TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs print-table">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3 w-10 text-center">No</th>
                <th className="py-3 px-3 w-28">NISN</th>
                <th className="py-3 px-3">Nama Siswa</th>
                <th className="py-3 px-3 text-center">
                  Formatif
                  <span className="block text-[10px] text-slate-400 font-normal">
                    ({weights.formatif}%)
                  </span>
                </th>
                <th className="py-3 px-3 text-center">
                  Sumatif Materi
                  <span className="block text-[10px] text-slate-400 font-normal">
                    ({weights.sumatifMateri}%)
                  </span>
                </th>
                <th className="py-3 px-3 text-center">
                  STS
                  <span className="block text-[10px] text-slate-400 font-normal">
                    ({weights.sts}%)
                  </span>
                </th>
                <th className="py-3 px-3 text-center">
                  SAS
                  <span className="block text-[10px] text-slate-400 font-normal">
                    ({weights.sas}%)
                  </span>
                </th>
                <th className="py-3 px-3 text-center bg-indigo-50/50">
                  Nilai Akhir (NA)
                </th>
                <th className="py-3 px-3 text-center w-24">Predikat</th>
                <th className="py-3 px-3 text-center w-28">Status</th>
                <th className="py-3 px-3 text-center w-20 no-print">Rapor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSummaries.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600 text-sm">Tidak ada siswa sesuai filter</p>
                  </td>
                </tr>
              ) : (
                filteredSummaries.map((item, idx) => {
                  const predObj = getPredicate(item.nilaiAkhir, profile.rentangPredikat);

                  return (
                    <tr key={item.student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">
                        {item.student.nisn || '-'}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {item.student.nama}
                      </td>

                      {/* Formatif Avg */}
                      <td className="py-2.5 px-3 text-center font-mono font-medium">
                        {item.rataFormatif !== null ? (
                          item.rataFormatif
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Belum Dinilai</span>
                        )}
                      </td>

                      {/* Sumatif Materi Avg */}
                      <td className="py-2.5 px-3 text-center font-mono font-medium">
                        {item.rataSumatifMateri !== null ? (
                          item.rataSumatifMateri
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Belum Dinilai</span>
                        )}
                      </td>

                      {/* STS */}
                      <td className="py-2.5 px-3 text-center font-mono font-medium">
                        {item.nilaiSTS !== null ? (
                          item.nilaiSTS
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Belum Dinilai</span>
                        )}
                      </td>

                      {/* SAS */}
                      <td className="py-2.5 px-3 text-center font-mono font-medium">
                        {item.nilaiSAS !== null ? (
                          item.nilaiSAS
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Belum Dinilai</span>
                        )}
                      </td>

                      {/* Nilai Akhir NA */}
                      <td className="py-2.5 px-3 text-center font-mono font-bold bg-indigo-50/30 text-indigo-900">
                        {item.nilaiAkhir !== null ? (
                          item.nilaiAkhir
                        ) : (
                          <span className="text-slate-400 italic font-normal text-[11px]">Belum Lengkap</span>
                        )}
                      </td>

                      {/* Predikat */}
                      <td className="py-2.5 px-3 text-center">
                        {item.predikat !== '-' ? (
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md font-bold text-[11px] border ${predObj.color}`}
                          >
                            {item.predikat}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">-</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 text-center">
                        {item.status === 'Tuntas' && (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Tuntas
                          </span>
                        )}
                        {item.status === 'Belum Tuntas' && (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Remedial
                          </span>
                        )}
                        {item.status === 'Belum Lengkap' && (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Belum Lengkap
                          </span>
                        )}
                      </td>

                      {/* Detail button */}
                      <td className="py-2.5 px-3 text-center no-print">
                        <button
                          onClick={() => onSelectStudentDetail(item.student.id)}
                          className="px-2 py-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          Lihat
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Table Footer Summary Row */}
            <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300 text-slate-800">
              <tr>
                <td colSpan={3} className="py-3 px-3 text-right uppercase text-[11px]">
                  Rata-Rata Kelas :
                </td>
                <td className="py-3 px-3 text-center font-mono text-indigo-700">
                  {classAvgFormatif !== null ? classAvgFormatif : '—'}
                </td>
                <td className="py-3 px-3 text-center font-mono text-indigo-700">
                  {classAvgSumatifMateri !== null ? classAvgSumatifMateri : '—'}
                </td>
                <td className="py-3 px-3 text-center font-mono text-indigo-700">
                  {classAvgSTS !== null ? classAvgSTS : '—'}
                </td>
                <td className="py-3 px-3 text-center font-mono text-indigo-700">
                  {classAvgSAS !== null ? classAvgSAS : '—'}
                </td>
                <td className="py-3 px-3 text-center font-mono text-indigo-900 bg-indigo-100/60">
                  {classAvgFinal !== null ? classAvgFinal : '—'}
                </td>
                <td colSpan={3} className="py-3 px-3 text-center text-slate-500 font-normal text-[11px]">
                  KKTP: {profile.kktp}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Official Signatures for Ledger Print */}
      <PrintSignatureFooter profile={profile} />
    </div>
  );
};
