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
  getStatusKetercapaian,
} from '../../utils/gradeCalculations';
import {
  Printer,
  ChevronLeft,
  ChevronRight,
  User,
  Award,
  Sparkles,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { printCurrentView } from '../../utils/exportUtils';
import { PrintHeader } from '../layout/PrintHeader';

interface StudentIndividualRekapProps {
  students: Student[];
  columns: AssessmentColumn[];
  scores: AssessmentScore[];
  profile: SchoolProfile;
  weights: AssessmentWeight;
  initialStudentId?: string;
}

export const StudentIndividualRekap: React.FC<StudentIndividualRekapProps> = ({
  students,
  columns,
  scores,
  profile,
  weights,
  initialStudentId,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentId || students[0]?.id || ''
  );

  const currentIndex = students.findIndex((s) => s.id === selectedStudentId);
  const currentStudent = students[currentIndex] || students[0];

  if (!currentStudent) {
    return (
      <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
        Belum ada data siswa untuk ditampilkan. Silakan tambahkan siswa di menu <strong>Daftar Siswa</strong>.
      </div>
    );
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setSelectedStudentId(students[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < students.length - 1) {
      setSelectedStudentId(students[currentIndex + 1].id);
    }
  };

  // Group columns by type
  const diagCols = columns.filter((c) => c.type === 'diagnostik');
  const formatifCols = columns.filter((c) => c.type === 'formatif');
  const sumatifMateriCols = columns.filter((c) => c.type === 'sumatif_materi');
  const stsCols = columns.filter((c) => c.type === 'sts');
  const sasCols = columns.filter((c) => c.type === 'sas');

  // Compute student scores
  const getScore = (colId: string): AssessmentScore | undefined => {
    return scores.find((s) => s.studentId === currentStudent.id && s.columnId === colId);
  };

  const formatifScores = formatifCols.map((c) => getScore(c.id)?.nilai ?? null);
  const sumatifScores = sumatifMateriCols.map((c) => getScore(c.id)?.nilai ?? null);
  const stsScores = stsCols.map((c) => getScore(c.id)?.nilai ?? null);
  const sasScores = sasCols.map((c) => getScore(c.id)?.nilai ?? null);

  const avgFormatif = calculateAverage(formatifScores);
  const avgSumatif = calculateAverage(sumatifScores);
  const avgSTS = calculateAverage(stsScores);
  const avgSAS = calculateAverage(sasScores);

  const finalScore = calculateFinalScore(
    avgFormatif,
    avgSumatif,
    avgSTS,
    avgSAS,
    weights
  );

  const finalPred = getPredicate(finalScore, profile.rentangPredikat);

  // Generate Kurikulum Merdeka Competency Description
  // Identify highest mastered TP and lowest TP needing guidance
  const academicColumns = [...formatifCols, ...sumatifMateriCols];
  const academicScored: { col: AssessmentColumn; score: number; catatan: string | undefined }[] = [];

  for (const col of academicColumns) {
    const sc = getScore(col.id);
    if (sc?.nilai !== null && sc?.nilai !== undefined) {
      academicScored.push({ col, score: sc.nilai, catatan: sc.catatan });
    }
  }

  academicScored.sort((a, b) => b.score - a.score);

  const highestTP = academicScored[0];
  const lowestTP = academicScored[academicScored.length - 1];

  let capaianTertinggiText = highestTP
    ? `Menunjukkan penguasaan sangat baik dalam ${highestTP.col.namaMateri.toLowerCase()}`
    : 'Belum ada penilaian sumatif yang tercatat.';

  let perluBimbinganText = lowestTP && lowestTP.score < profile.kktp
    ? `Perlu bimbingan dan latihan mandiri lebih lanjut dalam ${lowestTP.col.namaMateri.toLowerCase()}`
    : 'Menunjukkan pemenuhan tujuan pembelajaran secara konsisten pada seluruh lingkup materi.';

  return (
    <div className="space-y-6">
      {/* Printable Header */}
      <PrintHeader
        profile={profile}
        title="LEMBAR LAPORAN HASIL PENILAIAN INDIVIDU PESERTA DIDIK"
        subtitle={`Tahun Ajaran ${profile.tahunAjaran} · Semester ${profile.semester}`}
      />

      {/* Student Selector Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs no-print">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="font-semibold text-slate-700 whitespace-nowrap">
            Pilih Peserta Didik:
          </label>
          <select
            value={currentStudent.id}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="p-2 border border-slate-200 rounded-xl bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
          >
            {students.map((s, idx) => (
              <option key={s.id} value={s.id}>
                {idx + 1}. {s.nama} ({s.nisn || s.nis})
              </option>
            ))}
          </select>
        </div>

        {/* Previous / Next pagination & Print */}
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Siswa Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-mono text-[11px] text-slate-500 border-x border-slate-200">
              {currentIndex + 1} / {students.length}
            </span>
            <button
              onClick={handleNext}
              disabled={currentIndex === students.length - 1}
              className="p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Siswa Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => printCurrentView(`Rapor Individu_${currentStudent.nama}`)}
            className="flex items-center gap-1.5 px-3.5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Rapor Siswa</span>
          </button>
        </div>
      </div>

      {/* Student Identity Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
              {currentStudent.nama.charAt(0)}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{currentStudent.nama}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                NISN: {currentStudent.nisn || '-'} · NIS: {currentStudent.nis || '-'} · Jenis Kelamin: {currentStudent.jenisKelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Nilai Akhir (NA)</span>
              <span className="text-2xl font-bold font-mono text-indigo-600">
                {finalScore !== null ? finalScore : '—'}
              </span>
            </div>
            <div className="text-right pl-3 border-l border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Predikat</span>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-lg font-bold text-sm border mt-0.5 ${finalPred.color}`}
              >
                {finalPred.predikat !== '-' ? `${finalPred.predikat} (${finalPred.label})` : 'Belum Lengkap'}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Pillars Summary Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-500 font-medium">Rata-Rata Formatif</span>
            <p className="text-base font-bold font-mono text-slate-800 mt-0.5">
              {avgFormatif !== null ? avgFormatif : 'Belum Dinilai'}
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-500 font-medium">Rata-Rata Sumatif Materi</span>
            <p className="text-base font-bold font-mono text-slate-800 mt-0.5">
              {avgSumatif !== null ? avgSumatif : 'Belum Dinilai'}
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-500 font-medium">Nilai STS</span>
            <p className="text-base font-bold font-mono text-slate-800 mt-0.5">
              {avgSTS !== null ? avgSTS : 'Belum Dinilai'}
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-500 font-medium">Nilai SAS</span>
            <p className="text-base font-bold font-mono text-slate-800 mt-0.5">
              {avgSAS !== null ? avgSAS : 'Belum Dinilai'}
            </p>
          </div>
        </div>
      </div>

      {/* Kurikulum Merdeka Competency Description Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-indigo-700">
          <Award className="w-5 h-5" />
          <h3 className="text-sm font-bold text-slate-900">
            Deskripsi Capaian Kompetensi Belajar (Rapor Kurikulum Merdeka)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl">
            <span className="font-bold text-emerald-800 flex items-center gap-1.5 mb-1 text-[11px] uppercase">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Capaian Kompetensi Tertinggi
            </span>
            <p className="text-slate-800 leading-relaxed">{capaianTertinggiText}</p>
          </div>

          <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl">
            <span className="font-bold text-amber-800 flex items-center gap-1.5 mb-1 text-[11px] uppercase">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Perlu Peningkatan / Pendampingan
            </span>
            <p className="text-slate-800 leading-relaxed">{perluBimbinganText}</p>
          </div>
        </div>
      </div>

      {/* DETAILED TABLES ACCORDION / SECTIONS FOR THE 5 TYPES */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Rincian Lengkap Hasil Penilaian Seluruh Asesmen
          </h3>
        </div>

        <div className="p-4 space-y-6 text-xs">
          {/* Section 1: Diagnostik */}
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2">
              <span className="font-bold text-slate-800">
                1. Penilaian Diagnostik (Awal Pembelajaran)
              </span>
              <span className="text-[10px] text-slate-500 italic">
                *Tidak masuk nilai akhir rapor
              </span>
            </div>
            <table className="w-full text-left border-collapse print-table">
              <thead className="bg-slate-100 text-[10px] text-slate-600 font-bold">
                <tr>
                  <th className="p-2 w-16">Kode</th>
                  <th className="p-2">Materi / Instrumen Diagnostik</th>
                  <th className="p-2 w-24">Jenis</th>
                  <th className="p-2 w-24 text-center">Nilai</th>
                  <th className="p-2">Catatan Guru / Gaya Belajar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {diagCols.map((col) => {
                  const sc = getScore(col.id);
                  return (
                    <tr key={col.id}>
                      <td className="p-2 font-mono font-semibold text-slate-700">{col.kode}</td>
                      <td className="p-2 text-slate-900">{col.namaMateri}</td>
                      <td className="p-2 text-slate-600">{col.jenisDiagnostik || '-'}</td>
                      <td className="p-2 text-center font-mono font-bold text-slate-800">
                        {sc?.nilai !== null && sc?.nilai !== undefined ? sc.nilai : 'Belum Dinilai'}
                      </td>
                      <td className="p-2 text-slate-600 italic">{sc?.catatan || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Section 2: Formatif */}
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2">
              <span className="font-bold text-slate-800">
                2. Penilaian Formatif (Proses Tujuan Pembelajaran)
              </span>
              <span className="text-[11px] font-bold text-indigo-700">
                Rata-rata: {avgFormatif !== null ? avgFormatif : '—'}
              </span>
            </div>
            <table className="w-full text-left border-collapse print-table">
              <thead className="bg-slate-100 text-[10px] text-slate-600 font-bold">
                <tr>
                  <th className="p-2 w-16">Kode</th>
                  <th className="p-2">Tujuan Pembelajaran (TP)</th>
                  <th className="p-2 w-24 text-center">Nilai</th>
                  <th className="p-2 w-24 text-center">Predikat</th>
                  <th className="p-2">Umpan Balik Guru</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {formatifCols.map((col) => {
                  const sc = getScore(col.id);
                  const val = sc?.nilai ?? null;
                  const pred = getPredicate(val, profile.rentangPredikat);
                  return (
                    <tr key={col.id}>
                      <td className="p-2 font-mono font-semibold text-slate-700">{col.kode}</td>
                      <td className="p-2 text-slate-900">{col.namaMateri}</td>
                      <td className="p-2 text-center font-mono font-bold text-slate-800">
                        {val !== null ? val : 'Belum Dinilai'}
                      </td>
                      <td className="p-2 text-center">
                        {pred.predikat !== '-' ? (
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] border ${pred.color}`}>
                            {pred.predikat}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="p-2 text-slate-600">{sc?.catatan || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Section 3: Sumatif Materi */}
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2">
              <span className="font-bold text-slate-800">
                3. Sumatif Akhir Lingkup Materi (Bab / Topik)
              </span>
              <span className="text-[11px] font-bold text-indigo-700">
                Rata-rata: {avgSumatif !== null ? avgSumatif : '—'}
              </span>
            </div>
            <table className="w-full text-left border-collapse print-table">
              <thead className="bg-slate-100 text-[10px] text-slate-600 font-bold">
                <tr>
                  <th className="p-2 w-16">Kode</th>
                  <th className="p-2">Materi Uji</th>
                  <th className="p-2 w-24 text-center">Nilai</th>
                  <th className="p-2 w-24 text-center">Status</th>
                  <th className="p-2">Tindak Lanjut / Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sumatifMateriCols.map((col) => {
                  const sc = getScore(col.id);
                  const val = sc?.nilai ?? null;
                  const stat = getStatusKetercapaian(val, profile.kktp);
                  return (
                    <tr key={col.id}>
                      <td className="p-2 font-mono font-semibold text-slate-700">{col.kode}</td>
                      <td className="p-2 text-slate-900">{col.namaMateri}</td>
                      <td className="p-2 text-center font-mono font-bold text-slate-800">
                        {val !== null ? val : 'Belum Dinilai'}
                      </td>
                      <td className="p-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${stat.bg} ${stat.color}`}>
                          {stat.status}
                        </span>
                      </td>
                      <td className="p-2 text-slate-600">
                        {sc?.catatan || (val !== null && val < profile.kktp ? 'Perlu remedial' : '-')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Section 4 & 5: STS and SAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="pb-2 border-b border-slate-200 mb-2 font-bold text-slate-800">
                4. Sumatif Tengah Semester (STS)
              </div>
              <table className="w-full text-left border-collapse print-table">
                <thead className="bg-slate-100 text-[10px] text-slate-600 font-bold">
                  <tr>
                    <th className="p-2">Materi</th>
                    <th className="p-2 w-20 text-center">Nilai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stsCols.map((col) => (
                    <tr key={col.id}>
                      <td className="p-2">{col.namaMateri}</td>
                      <td className="p-2 text-center font-mono font-bold">
                        {getScore(col.id)?.nilai ?? 'Belum Dinilai'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <div className="pb-2 border-b border-slate-200 mb-2 font-bold text-slate-800">
                5. Sumatif Akhir Semester (SAS)
              </div>
              <table className="w-full text-left border-collapse print-table">
                <thead className="bg-slate-100 text-[10px] text-slate-600 font-bold">
                  <tr>
                    <th className="p-2">Materi</th>
                    <th className="p-2 w-20 text-center">Nilai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sasCols.map((col) => (
                    <tr key={col.id}>
                      <td className="p-2">{col.namaMateri}</td>
                      <td className="p-2 text-center font-mono font-bold">
                        {getScore(col.id)?.nilai ?? 'Belum Dinilai'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Signature blocks (Teacher, Parent, Principal for official report card) */}
      <div className="print-only mt-12 pt-4 break-inside-avoid text-xs text-slate-900">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="mb-1">Mengetahui,</p>
            <p className="font-semibold">Orang Tua / Wali Siswa</p>
            <div className="h-16"></div>
            <p className="font-bold underline">............................................</p>
          </div>

          <div>
            <p className="mb-1">Tempat, {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
            <p className="font-semibold">Guru Pengampu</p>
            <div className="h-16"></div>
            <p className="font-bold underline uppercase">{profile.namaGuru || '................................'}</p>
            <p className="text-[10px] text-slate-600">NIP. {profile.nipGuru || '................................'}</p>
          </div>

          <div>
            <p className="mb-1">Mengetahui,</p>
            <p className="font-semibold">Kepala Sekolah</p>
            <div className="h-16"></div>
            <p className="font-bold underline uppercase">{profile.kepalaSekolah || '................................'}</p>
            <p className="text-[10px] text-slate-600">NIP. {profile.nipKepalaSekolah || '................................'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
