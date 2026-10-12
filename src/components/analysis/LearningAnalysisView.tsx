import React, { useState } from 'react';
import {
  AssessmentColumn,
  AssessmentScore,
  AssessmentWeight,
  SchoolProfile,
  Student,
} from '../../types/assessment';
import {
  calculateAverage,
  calculateFinalScore,
  getPredicate,
} from '../../utils/gradeCalculations';
import {
  BarChart2,
  TrendingUp,
  AlertTriangle,
  Award,
  BookOpen,
  Users,
  CheckCircle2,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { printCurrentView } from '../../utils/exportUtils';
import { PrintHeader } from '../layout/PrintHeader';

interface LearningAnalysisViewProps {
  students: Student[];
  columns: AssessmentColumn[];
  scores: AssessmentScore[];
  profile: SchoolProfile;
  weights: AssessmentWeight;
  onNavigateToRemedial: () => void;
}

export const LearningAnalysisView: React.FC<LearningAnalysisViewProps> = ({
  students,
  columns,
  scores,
  profile,
  weights,
  onNavigateToRemedial,
}) => {
  // Calculate final score distribution
  const studentFinalScores = students.map((std) => {
    const formatifScores = columns
      .filter((c) => c.type === 'formatif')
      .map((c) => scores.find((s) => s.studentId === std.id && s.columnId === c.id)?.nilai ?? null);
    const sumatifScores = columns
      .filter((c) => c.type === 'sumatif_materi')
      .map((c) => scores.find((s) => s.studentId === std.id && s.columnId === c.id)?.nilai ?? null);
    const stsScores = columns
      .filter((c) => c.type === 'sts')
      .map((c) => scores.find((s) => s.studentId === std.id && s.columnId === c.id)?.nilai ?? null);
    const sasScores = columns
      .filter((c) => c.type === 'sas')
      .map((c) => scores.find((s) => s.studentId === std.id && s.columnId === c.id)?.nilai ?? null);

    const finalVal = calculateFinalScore(
      calculateAverage(formatifScores),
      calculateAverage(sumatifScores),
      calculateAverage(stsScores),
      calculateAverage(sasScores),
      weights
    );

    return {
      student: std,
      finalScore: finalVal,
      predikat: getPredicate(finalVal, profile.rentangPredikat),
    };
  });

  // Score brackets: A (89-100), B (78-88), C (67-77), D (<67)
  const countA = studentFinalScores.filter((s) => s.predikat.predikat === 'A').length;
  const countB = studentFinalScores.filter((s) => s.predikat.predikat === 'B').length;
  const countC = studentFinalScores.filter((s) => s.predikat.predikat === 'C').length;
  const countD = studentFinalScores.filter((s) => s.predikat.predikat === 'D').length;
  const countUncompleted = studentFinalScores.filter((s) => s.finalScore === null).length;

  const totalGraded = students.length - countUncompleted;
  const maxBracketCount = Math.max(countA, countB, countC, countD, 1);

  // Pillar average comparisons
  const getPillarAverage = (type: AssessmentColumn['type']): number | null => {
    const colIds = columns.filter((c) => c.type === type).map((c) => c.id);
    const typeScores = scores.filter((s) => colIds.includes(s.columnId)).map((s) => s.nilai);
    return calculateAverage(typeScores);
  };

  const avgDiag = getPillarAverage('diagnostik');
  const avgFormatif = getPillarAverage('formatif');
  const avgSumatif = getPillarAverage('sumatif_materi');
  const avgSTS = getPillarAverage('sts');
  const avgSAS = getPillarAverage('sas');

  // Identify TP / Topics with lowest mastery (need attention)
  const topicsAnalysis = columns.map((col) => {
    const colScores = students.map((std) => {
      const sc = scores.find((s) => s.studentId === std.id && s.columnId === col.id);
      return sc?.nilai ?? null;
    });

    const validColScores = colScores.filter((s): s is number => s !== null && s !== undefined);
    const colAvg = calculateAverage(validColScores);
    const kktpTarget = col.kktpKhusus ?? profile.kktp;
    const belowKktpCount = validColScores.filter((s) => s < kktpTarget).length;
    const passRate = validColScores.length > 0
      ? Math.round(((validColScores.length - belowKktpCount) / validColScores.length) * 100)
      : 0;

    return {
      column: col,
      avg: colAvg,
      totalAssessed: validColScores.length,
      belowKktpCount,
      passRate,
    };
  });

  // Sort lowest pass rate first
  const sortedTopics = [...topicsAnalysis].sort((a, b) => a.passRate - b.passRate);

  return (
    <div className="space-y-6">
      {/* Printable Header */}
      <PrintHeader
        profile={profile}
        title="ANALISIS HASIL BELAJAR DAN GRAFIK PENCAPAIAN KOMPETENSI"
        subtitle={`Evaluasi Komprehensif Pencapaian Kelas ${profile.kelas} · KKTP: ${profile.kktp}`}
      />

      {/* Top Banner & Quick Remedial Link */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Analisis Komprehensif Capaian Belajar Peserta Didik
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Menampilkan visualisasi distribusi nilai, perbandingan jenis asesmen, dan identifikasi materi yang memerlukan penguatan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => printCurrentView(`Analisis Hasil Belajar ${profile.kelas}`)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Analisis</span>
          </button>

          <button
            onClick={onNavigateToRemedial}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
          >
            <span>Daftar Tindak Lanjut</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Visual Section: Distribution Chart & Pillar Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: Distribusi Predikat Nilai Akhir */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-600" />
                <span>Distribusi Predikat Nilai Akhir Siswa</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Berdasarkan skala KKTP dan rentang predikat
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-700">
              {totalGraded} / {students.length} Siswa
            </span>
          </div>

          {/* Bar Visualizer */}
          <div className="space-y-3 pt-2 text-xs">
            {/* Predikat A */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-emerald-800">
                  Predikat A ({profile.rentangPredikat.A.min}–{profile.rentangPredikat.A.max}) - Sangat Baik
                </span>
                <span className="font-mono font-bold text-emerald-700">
                  {countA} Siswa ({totalGraded > 0 ? Math.round((countA / totalGraded) * 100) : 0}%)
                </span>
              </div>
              <div className="h-6 w-full bg-slate-100 rounded-lg overflow-hidden flex items-center p-1">
                <div
                  className="h-full bg-emerald-500 rounded-md transition-all duration-500"
                  style={{ width: `${(countA / maxBracketCount) * 100}%` }}
                />
              </div>
            </div>

            {/* Predikat B */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-blue-800">
                  Predikat B ({profile.rentangPredikat.B.min}–{profile.rentangPredikat.B.max}) - Baik
                </span>
                <span className="font-mono font-bold text-blue-700">
                  {countB} Siswa ({totalGraded > 0 ? Math.round((countB / totalGraded) * 100) : 0}%)
                </span>
              </div>
              <div className="h-6 w-full bg-slate-100 rounded-lg overflow-hidden flex items-center p-1">
                <div
                  className="h-full bg-blue-500 rounded-md transition-all duration-500"
                  style={{ width: `${(countB / maxBracketCount) * 100}%` }}
                />
              </div>
            </div>

            {/* Predikat C */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-amber-800">
                  Predikat C ({profile.rentangPredikat.C.min}–{profile.rentangPredikat.C.max}) - Cukup
                </span>
                <span className="font-mono font-bold text-amber-700">
                  {countC} Siswa ({totalGraded > 0 ? Math.round((countC / totalGraded) * 100) : 0}%)
                </span>
              </div>
              <div className="h-6 w-full bg-slate-100 rounded-lg overflow-hidden flex items-center p-1">
                <div
                  className="h-full bg-amber-500 rounded-md transition-all duration-500"
                  style={{ width: `${(countC / maxBracketCount) * 100}%` }}
                />
              </div>
            </div>

            {/* Predikat D */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-rose-800">
                  Predikat D (0–{profile.rentangPredikat.D.max}) - Perlu Bimbingan / Remedial
                </span>
                <span className="font-mono font-bold text-rose-700">
                  {countD} Siswa ({totalGraded > 0 ? Math.round((countD / totalGraded) * 100) : 0}%)
                </span>
              </div>
              <div className="h-6 w-full bg-slate-100 rounded-lg overflow-hidden flex items-center p-1">
                <div
                  className="h-full bg-rose-500 rounded-md transition-all duration-500"
                  style={{ width: `${(countD / maxBracketCount) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CHART 2: Perbandingan Rata-Rata 5 Menu Penilaian */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Rata-Rata Capaian Tiap Jenis Penilaian</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Evaluasi progres dari asesmen awal hingga sumatif akhir
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
              Target KKTP: {profile.kktp}
            </span>
          </div>

          <div className="space-y-3.5 pt-2 text-xs">
            {/* Diagnostik */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-slate-700">1. Penilaian Diagnostik (Awal)</span>
                <span className="font-mono font-bold text-slate-800">
                  {avgDiag !== null ? avgDiag : 'Belum Ada'}
                </span>
              </div>
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-400 rounded-full"
                  style={{ width: `${avgDiag || 0}%` }}
                />
              </div>
            </div>

            {/* Formatif */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-slate-700">2. Penilaian Formatif (Proses TP)</span>
                <span className="font-mono font-bold text-indigo-700">
                  {avgFormatif !== null ? avgFormatif : 'Belum Ada'}
                </span>
              </div>
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${avgFormatif || 0}%` }}
                />
              </div>
            </div>

            {/* Sumatif Materi */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-slate-700">3. Sumatif Akhir Lingkup Materi</span>
                <span className="font-mono font-bold text-blue-700">
                  {avgSumatif !== null ? avgSumatif : 'Belum Ada'}
                </span>
              </div>
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${avgSumatif || 0}%` }}
                />
              </div>
            </div>

            {/* STS */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-slate-700">4. Sumatif Tengah Semester (STS)</span>
                <span className="font-mono font-bold text-emerald-700">
                  {avgSTS !== null ? avgSTS : 'Belum Ada'}
                </span>
              </div>
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${avgSTS || 0}%` }}
                />
              </div>
            </div>

            {/* SAS */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-slate-700">5. Sumatif Akhir Semester (SAS)</span>
                <span className="font-mono font-bold text-purple-700">
                  {avgSAS !== null ? avgSAS : 'Belum Ada'}
                </span>
              </div>
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${avgSAS || 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE: Analisis Ketuntasan per Materi / TP */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Analisis Daya Serap & Ketuntasan per Tujuan Pembelajaran / Materi
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Urutan berdasarkan persentase ketuntasan untuk prioritas remedial dan pengayaan
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs print-table">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3 w-12 text-center">No</th>
                <th className="p-3 w-28">Kategori</th>
                <th className="p-3 w-24">Kode</th>
                <th className="p-3">Tujuan Pembelajaran / Materi</th>
                <th className="p-3 w-24 text-center">Rata-Rata</th>
                <th className="p-3 w-28 text-center">Perlu Remedial</th>
                <th className="p-3 w-32 text-center">% Ketuntasan</th>
                <th className="p-3 w-36 text-center">Rekomendasi Tindak Lanjut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedTopics.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Belum ada kolom penilaian yang terdaftar.
                  </td>
                </tr>
              ) : (
                sortedTopics.map((item, idx) => {
                  const isLow = item.passRate < 70;
                  return (
                    <tr key={item.column.id} className="hover:bg-slate-50">
                      <td className="p-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="p-3 font-semibold text-slate-600 capitalize">
                        {item.column.type.replace('_', ' ')}
                      </td>
                      <td className="p-3 font-mono font-bold text-indigo-700">{item.column.kode}</td>
                      <td className="p-3 font-medium text-slate-900">{item.column.namaMateri}</td>
                      <td className="p-3 text-center font-mono font-bold text-slate-800">
                        {item.avg !== null ? item.avg : 'Belum Ada'}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded ${
                            item.belowKktpCount > 0 ? 'bg-rose-50 text-rose-700' : 'text-slate-500'
                          }`}
                        >
                          {item.belowKktpCount} Siswa
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span
                            className={`font-mono font-bold ${
                              isLow ? 'text-rose-600' : 'text-emerald-600'
                            }`}
                          >
                            {item.passRate}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        {item.belowKktpCount > 0 ? (
                          <span className="inline-block px-2.5 py-0.5 text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded-full">
                            Remedial Kelompok ({item.belowKktpCount})
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                            Tuntas Seluruhnya
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
