import React from 'react';
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
} from '../../utils/gradeCalculations';
import {
  Users,
  Brain,
  FileSpreadsheet,
  Award,
  CalendarCheck2,
  GraduationCap,
  TableProperties,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Layers,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { NavigationTab } from '../layout/Sidebar';

interface DashboardOverviewProps {
  students: Student[];
  columns: AssessmentColumn[];
  scores: AssessmentScore[];
  profile: SchoolProfile;
  weights: AssessmentWeight;
  onNavigate: (tab: NavigationTab) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  students,
  columns,
  scores,
  profile,
  weights,
  onNavigate,
}) => {
  // Compute metrics for the 5 menus
  const getMenuStats = (type: AssessmentColumn['type']) => {
    const typeCols = columns.filter((c) => c.type === type);
    const colIds = typeCols.map((c) => c.id);
    const totalPotentialScores = students.length * typeCols.length;
    const filledScores = scores.filter(
      (s) => colIds.includes(s.columnId) && s.nilai !== null && s.nilai !== undefined
    ).length;

    const completionRate =
      totalPotentialScores > 0 ? Math.round((filledScores / totalPotentialScores) * 100) : 0;

    const validScoreVals = scores
      .filter((s) => colIds.includes(s.columnId) && s.nilai !== null && s.nilai !== undefined)
      .map((s) => s.nilai);

    const avgVal = calculateAverage(validScoreVals);

    return {
      topicCount: typeCols.length,
      filledScores,
      totalPotentialScores,
      completionRate,
      average: avgVal,
    };
  };

  const statDiag = getMenuStats('diagnostik');
  const statFormatif = getMenuStats('formatif');
  const statSumatif = getMenuStats('sumatif_materi');
  const statSTS = getMenuStats('sts');
  const statSAS = getMenuStats('sas');

  // Overall class final scores
  const studentFinalScores = students.map((std) => {
    const fScores = columns.filter((c) => c.type === 'formatif').map((c) => scores.find((s) => s.studentId === std.id && s.columnId === c.id)?.nilai ?? null);
    const sScores = columns.filter((c) => c.type === 'sumatif_materi').map((c) => scores.find((s) => s.studentId === std.id && s.columnId === c.id)?.nilai ?? null);
    const stsScores = columns.filter((c) => c.type === 'sts').map((c) => scores.find((s) => s.studentId === std.id && s.columnId === c.id)?.nilai ?? null);
    const sasScores = columns.filter((c) => c.type === 'sas').map((c) => scores.find((s) => s.studentId === std.id && s.columnId === c.id)?.nilai ?? null);

    return calculateFinalScore(
      calculateAverage(fScores),
      calculateAverage(sScores),
      calculateAverage(stsScores),
      calculateAverage(sasScores),
      weights
    );
  });

  const validFinals = studentFinalScores.filter((s): s is number => s !== null);
  const classAvgFinal = calculateAverage(validFinals);
  const totalPassed = validFinals.filter((s) => s >= profile.kktp).length;
  const totalNeedRemedial = validFinals.filter((s) => s < profile.kktp).length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 text-[11px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 rounded-lg">
              Kurikulum Merdeka & Nasional
            </span>
            <span className="text-xs text-slate-300">
              {profile.tahunAjaran} · Semester {profile.semester.split(' ')[0]}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Selamat Datang, {profile.namaGuru}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
            Buku Nilai & Manajemen Penilaian Kelas <strong>{profile.kelas}</strong> ({profile.fase}) pada mata pelajaran <strong>{profile.mataPelajaran}</strong> di {profile.namaSekolah}.
          </p>

          <div className="flex items-center gap-3 mt-5 flex-wrap">
            <button
              onClick={() => onNavigate('formatif')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Input Nilai Formatif</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('rekap_kelas')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
            >
              <TableProperties className="w-3.5 h-3.5 text-indigo-400" />
              <span>Lihat Ledger Rapor</span>
            </button>
          </div>
        </div>

        {/* Decorative corner accent */}
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none hidden md:block" />
      </div>

      {/* High-level Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Siswa</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <h3 className="text-2xl font-bold font-mono text-slate-900 mt-1.5">{students.length}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Siswa aktif terdaftar</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rata-Rata Kelas</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-bold font-mono text-emerald-600 mt-1.5">
            {classAvgFinal !== null ? classAvgFinal : '—'}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">KKTP: {profile.kktp}</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Siswa Tuntas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-bold font-mono text-slate-900 mt-1.5">{totalPassed}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {students.length ? Math.round((totalPassed / students.length) * 100) : 0}% di atas target
          </p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Perlu Tindak Lanjut</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <h3 className="text-2xl font-bold font-mono text-rose-600 mt-1.5">{totalNeedRemedial}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Program remedial aktif</p>
        </div>
      </div>

      {/* 5 PRIMARY ASSESSMENT MENUS OVERVIEW SECTION */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Status & Progres 5 Menu Penilaian Utama</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Klik pada salah satu jenis penilaian untuk mengelola materi dan mengisi nilai siswa.
            </p>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Bobot Nilai Akhir: Formatif {weights.formatif}%, Sumatif {weights.sumatifMateri}%, STS {weights.sts}%, SAS {weights.sas}%
          </span>
        </div>

        {/* 5 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5 text-xs">
          {/* 1. Diagnostik */}
          <div
            onClick={() => onNavigate('diagnostik')}
            className="p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-sm cursor-pointer transition-all bg-slate-50/50 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <Brain className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                  Awal
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">1. Diagnostik</h4>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                Pemetaan kesiapan & gaya belajar awal. Tidak masuk nilai akhir rapor.
              </p>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-200 space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">{statDiag.topicCount} Instrumen</span>
                <span className="font-mono font-bold text-slate-700">
                  {statDiag.average !== null ? `Rata: ${statDiag.average}` : 'Belum Ada'}
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${statDiag.completionRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* 2. Formatif */}
          <div
            onClick={() => onNavigate('formatif')}
            className="p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-sm cursor-pointer transition-all bg-slate-50/50 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  Proses
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">2. Formatif</h4>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                Penilaian proses pembelajaran per Tujuan Pembelajaran (TP) & observasi.
              </p>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-200 space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">{statFormatif.topicCount} TP</span>
                <span className="font-mono font-bold text-indigo-700">
                  {statFormatif.average !== null ? `Rata: ${statFormatif.average}` : 'Belum Ada'}
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{ width: `${statFormatif.completionRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* 3. Sumatif Materi */}
          <div
            onClick={() => onNavigate('sumatif_materi')}
            className="p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-sm cursor-pointer transition-all bg-slate-50/50 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  Materi
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">3. Sumatif Materi</h4>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                Asesmen sumatif lingkup materi (Bab/Topik) penentu ketuntasan per materi.
              </p>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-200 space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">{statSumatif.topicCount} Bab</span>
                <span className="font-mono font-bold text-blue-700">
                  {statSumatif.average !== null ? `Rata: ${statSumatif.average}` : 'Belum Ada'}
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${statSumatif.completionRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* 4. STS */}
          <div
            onClick={() => onNavigate('sts')}
            className="p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-sm cursor-pointer transition-all bg-slate-50/50 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <CalendarCheck2 className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  STS
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">4. Sumatif STS</h4>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                Evaluasi Sumatif Tengah Semester penilaian pertengahan semester.
              </p>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-200 space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">{statSTS.topicCount} Asesmen</span>
                <span className="font-mono font-bold text-emerald-700">
                  {statSTS.average !== null ? `Rata: ${statSTS.average}` : 'Belum Ada'}
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full"
                  style={{ width: `${statSTS.completionRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* 5. SAS */}
          <div
            onClick={() => onNavigate('sas')}
            className="p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-sm cursor-pointer transition-all bg-slate-50/50 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <GraduationCap className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  SAS / SAT
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">5. Sumatif SAS</h4>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                Asesmen Akhir Semester / Akhir Tahun capaian kompetensi semester.
              </p>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-200 space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">{statSAS.topicCount} Asesmen</span>
                <span className="font-mono font-bold text-amber-700">
                  {statSAS.average !== null ? `Rata: ${statSAS.average}` : 'Belum Ada'}
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-600 rounded-full"
                  style={{ width: `${statSAS.completionRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links Section: Ledger, Rapor Individu, Analisis, Tindak Lanjut */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div
          onClick={() => onNavigate('rekap_kelas')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-400 cursor-pointer transition-all space-y-2"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TableProperties className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Rekap Kelas (Ledger Nilai)</h4>
          <p className="text-slate-500 leading-relaxed">
            Ledger gabungan seluruh asesmen dengan Nilai Akhir (NA), predikat, dan cetak format rapor dinas.
          </p>
        </div>

        <div
          onClick={() => onNavigate('rekap_individu')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-400 cursor-pointer transition-all space-y-2"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Rapor Individu Siswa</h4>
          <p className="text-slate-500 leading-relaxed">
            Lembar Hasil Belajar Siswa lengkap dengan deskripsi capaian kompetensi tertinggi & perlu bimbingan.
          </p>
        </div>

        <div
          onClick={() => onNavigate('tindak_lanjut')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-400 cursor-pointer transition-all space-y-2"
        >
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Remedial & Pengayaan</h4>
          <p className="text-slate-500 leading-relaxed">
            Daftar otomatis siswa di bawah KKTP untuk program perbaikan serta siswa berprestasi untuk pengayaan.
          </p>
        </div>
      </div>
    </div>
  );
};
