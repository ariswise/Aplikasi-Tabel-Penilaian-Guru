import {
  AssessmentColumn,
  AssessmentScore,
  AssessmentWeight,
  SchoolProfile,
  Student,
} from '../types/assessment';

const STORAGE_KEYS = {
  PROFILE: 'tabel_guru_school_profile',
  WEIGHTS: 'tabel_guru_weights',
  STUDENTS: 'tabel_guru_students',
  COLUMNS: 'tabel_guru_columns',
  SCORES: 'tabel_guru_scores',
  IS_INITIALIZED: 'tabel_guru_initialized',
};

export const DEFAULT_PROFILE: SchoolProfile = {
  namaSekolah: 'SMP Nusantara Cendekia',
  npsn: '20108992',
  alamat: 'Jl. Merdeka Belajar No. 45, Kompleks Pendidikan Nasional',
  kepalaSekolah: 'Dr. Ahmad Fauzi, M.Pd.',
  nipKepalaSekolah: '19720512 199803 1 003',
  namaGuru: 'Siti Rahmawati, S.Pd.',
  nipGuru: '19870814 201101 2 009',
  mataPelajaran: 'Ilmu Pengetahuan Alam (IPA)',
  fase: 'Fase D (Kelas 7-9)',
  kelas: 'VII A',
  semester: '1 (Ganjil)',
  tahunAjaran: '2024/2025',
  kktp: 75,
  rentangPredikat: {
    A: { min: 89, max: 100, label: 'Sangat Baik' },
    B: { min: 78, max: 88, label: 'Baik' },
    C: { min: 67, max: 77, label: 'Cukup' },
    D: { min: 0, max: 66, label: 'Perlu Bimbingan' },
  },
};

export const DEFAULT_WEIGHTS: AssessmentWeight = {
  formatif: 30,
  sumatifMateri: 30,
  sts: 20,
  sas: 20,
};

// Data demonstrasi awal (bukan data nyata individu, nama fiksyen untuk ilustrasi)
export const INITIAL_STUDENTS: Student[] = [
  { id: 'std-1', nisn: '0089123401', nis: '24001', nama: 'Aditya Pratama', jenisKelamin: 'L', kelas: 'VII A', status: 'Aktif' },
  { id: 'std-2', nisn: '0089123402', nis: '24002', nama: 'Anisa Rahmadani', jenisKelamin: 'P', kelas: 'VII A', status: 'Aktif' },
  { id: 'std-3', nisn: '0089123403', nis: '24003', nama: 'Bagus Setiawan', jenisKelamin: 'L', kelas: 'VII A', status: 'Aktif' },
  { id: 'std-4', nisn: '0089123404', nis: '24004', nama: 'Citra Dewi Lestari', jenisKelamin: 'P', kelas: 'VII A', status: 'Aktif' },
  { id: 'std-5', nisn: '0089123405', nis: '24005', nama: 'Dimas Arya Putra', jenisKelamin: 'L', kelas: 'VII A', status: 'Aktif' },
  { id: 'std-6', nisn: '0089123406', nis: '24006', nama: 'Fajar Nugraha', jenisKelamin: 'L', kelas: 'VII A', status: 'Aktif' },
  { id: 'std-7', nisn: '0089123407', nis: '24007', nama: 'Gita Permatasari', jenisKelamin: 'P', kelas: 'VII A', status: 'Aktif' },
  { id: 'std-8', nisn: '0089123408', nis: '24008', nama: 'Hendra Saputra', jenisKelamin: 'L', kelas: 'VII A', status: 'Aktif' },
  { id: 'std-9', nisn: '0089123409', nis: '24009', nama: 'Intan Nuraini', jenisKelamin: 'P', kelas: 'VII A', status: 'Aktif' },
  { id: 'std-10', nisn: '0089123410', nis: '24010', nama: 'Kevin Maulana', jenisKelamin: 'L', kelas: 'VII A', status: 'Aktif' },
];

export const INITIAL_COLUMNS: AssessmentColumn[] = [
  // 1. Diagnostik (Non-kognitif & Kognitif Awal)
  {
    id: 'col-diag-1',
    type: 'diagnostik',
    kode: 'DIAG-1',
    namaMateri: 'Asesmen Kesiapan Belajar Awal: Konsep Ekosistem',
    tanggal: '2024-07-22',
    jenisDiagnostik: 'Kognitif',
    keterangan: 'Pemetaan pemahaman dasar biotik & abiotik',
  },
  {
    id: 'col-diag-2',
    type: 'diagnostik',
    kode: 'DIAG-2',
    namaMateri: 'Gaya Belajar & Minat Sains',
    tanggal: '2024-07-23',
    jenisDiagnostik: 'Non-Kognitif',
    keterangan: 'Pemetaan modalitas visual, auditori, kinestetik',
  },

  // 2. Formatif (Penilaian Proses per TP)
  {
    id: 'col-form-1',
    type: 'formatif',
    kode: 'TP 7.1',
    namaMateri: 'Observasi Mikroskop & Sel Tumbuhan',
    tanggal: '2024-08-05',
    keterangan: 'Unjuk kerja praktikum mikroskop',
  },
  {
    id: 'col-form-2',
    type: 'formatif',
    kode: 'TP 7.2',
    namaMateri: 'Diskusi & Pembuatan Model Rantai Makanan',
    tanggal: '2024-08-20',
    keterangan: 'Presentasi kelompok ekosistem sawah',
  },
  {
    id: 'col-form-3',
    type: 'formatif',
    kode: 'TP 7.3',
    namaMateri: 'Kuis Singkat: Siklus Air dan Karbon',
    tanggal: '2024-09-02',
    keterangan: 'Tes formatif pemahaman siklus biogeokimia',
  },

  // 3. Sumatif Akhir Lingkup Materi (Sumatif TP/Bab)
  {
    id: 'col-sum-1',
    type: 'sumatif_materi',
    kode: 'SUM-1',
    namaMateri: 'Tes Sumatif Bab 1: Sel dan Mikroskop',
    tanggal: '2024-08-28',
    keterangan: 'Tes tertulis pilihan ganda & uraian',
  },
  {
    id: 'col-sum-2',
    type: 'sumatif_materi',
    kode: 'SUM-2',
    namaMateri: 'Tes Sumatif Bab 2: Interaksi Makhluk Hidup & Lingkungan',
    tanggal: '2024-09-18',
    keterangan: 'Tes tertulis & analisis kasus pencemaran',
  },

  // 4. Sumatif Tengah Semester (STS)
  {
    id: 'col-sts-1',
    type: 'sts',
    kode: 'STS-1',
    namaMateri: 'Sumatif Tengah Semester 1 (IPA Terpadu)',
    tanggal: '2024-10-02',
    keterangan: 'Cakupan Bab 1 dan Bab 2',
  },

  // 5. Sumatif Akhir Semester (SAS)
  {
    id: 'col-sas-1',
    type: 'sas',
    kode: 'SAS-1',
    namaMateri: 'Sumatif Akhir Semester Ganjil',
    tanggal: '2024-12-04',
    keterangan: 'Evaluasi menyeluruh Capaian Pembelajaran Semester 1',
  },
];

// Initial scores sample to immediately illustrate functionality
export const INITIAL_SCORES: AssessmentScore[] = [
  // Aditya Pratama
  { id: 'sc-1-1', studentId: 'std-1', columnId: 'col-diag-1', nilai: 80, catatan: 'Kesiapan awal cukup baik', updatedAt: '2024-07-22' },
  { id: 'sc-1-2', studentId: 'std-1', columnId: 'col-form-1', nilai: 88, catatan: 'Sangat terampil menggunakan mikroskop', updatedAt: '2024-08-05' },
  { id: 'sc-1-3', studentId: 'std-1', columnId: 'col-form-2', nilai: 85, catatan: 'Aktif berdiskusi', updatedAt: '2024-08-20' },
  { id: 'sc-1-4', studentId: 'std-1', columnId: 'col-form-3', nilai: 82, catatan: 'Memahami siklus biogeokimia', updatedAt: '2024-09-02' },
  { id: 'sc-1-5', studentId: 'std-1', columnId: 'col-sum-1', nilai: 86, catatan: 'Penguasaan konsep materi sel mantap', updatedAt: '2024-08-28' },
  { id: 'sc-1-6', studentId: 'std-1', columnId: 'col-sum-2', nilai: 84, catatan: 'Analisis ekosistem tepat', updatedAt: '2024-09-18' },
  { id: 'sc-1-7', studentId: 'std-1', columnId: 'col-sts-1', nilai: 88, catatan: 'Pertahankan prestasi', updatedAt: '2024-10-02' },
  { id: 'sc-1-8', studentId: 'std-1', columnId: 'col-sas-1', nilai: 90, catatan: 'Hasil belajar istimewa', updatedAt: '2024-12-04' },

  // Anisa Rahmadani
  { id: 'sc-2-1', studentId: 'std-2', columnId: 'col-diag-1', nilai: 90, catatan: 'Sangat siap dan membaca materi awal', updatedAt: '2024-07-22' },
  { id: 'sc-2-2', studentId: 'std-2', columnId: 'col-form-1', nilai: 94, catatan: 'Hasil preparat sangat rapi', updatedAt: '2024-08-05' },
  { id: 'sc-2-3', studentId: 'std-2', columnId: 'col-form-2', nilai: 92, catatan: 'Pemimpin kelompok yang baik', updatedAt: '2024-08-20' },
  { id: 'sc-2-4', studentId: 'std-2', columnId: 'col-form-3', nilai: 90, catatan: 'Sempurna pada siklus karbon', updatedAt: '2024-09-02' },
  { id: 'sc-2-5', studentId: 'std-2', columnId: 'col-sum-1', nilai: 95, catatan: 'Sangat memahami anatomi sel', updatedAt: '2024-08-28' },
  { id: 'sc-2-6', studentId: 'std-2', columnId: 'col-sum-2', nilai: 91, catatan: 'Jawaban analisis mendalam', updatedAt: '2024-09-18' },
  { id: 'sc-2-7', studentId: 'std-2', columnId: 'col-sts-1', nilai: 94, catatan: 'Istimewa', updatedAt: '2024-10-02' },
  { id: 'sc-2-8', studentId: 'std-2', columnId: 'col-sas-1', nilai: 96, catatan: 'Sangat membanggakan', updatedAt: '2024-12-04' },

  // Bagus Setiawan (Perlu remedial di beberapa TP)
  { id: 'sc-3-1', studentId: 'std-3', columnId: 'col-diag-1', nilai: 60, catatan: 'Perlu penguatan konsep dasar', updatedAt: '2024-07-22' },
  { id: 'sc-3-2', studentId: 'std-3', columnId: 'col-form-1', nilai: 70, catatan: 'Masih ragu mengatur lensa okuler', updatedAt: '2024-08-05' },
  { id: 'sc-3-3', studentId: 'std-3', columnId: 'col-form-2', nilai: 72, catatan: 'Cukup aktif, perlu dorongan', updatedAt: '2024-08-20' },
  { id: 'sc-3-4', studentId: 'std-3', columnId: 'col-form-3', nilai: 68, catatan: 'Perlu bimbingan siklus nitrogen', updatedAt: '2024-09-02' },
  { id: 'sc-3-5', studentId: 'std-3', columnId: 'col-sum-1', nilai: 68, catatan: 'Remedial Bab 1 dilaksanakan', remedialNilai: 76, tindakLanjut: 'Remedial', updatedAt: '2024-08-28' },
  { id: 'sc-3-6', studentId: 'std-3', columnId: 'col-sum-2', nilai: 73, catatan: 'Perlu tambahan latihan soal', updatedAt: '2024-09-18' },
  { id: 'sc-3-7', studentId: 'std-3', columnId: 'col-sts-1', nilai: 72, catatan: 'Perlu pendampingan belajar', updatedAt: '2024-10-02' },
  { id: 'sc-3-8', studentId: 'std-3', columnId: 'col-sas-1', nilai: 75, catatan: 'Ada peningkatan semangat belajar', updatedAt: '2024-12-04' },

  // Citra Dewi Lestari
  { id: 'sc-4-1', studentId: 'std-4', columnId: 'col-diag-1', nilai: 85, catatan: 'Pemahaman awal memadai', updatedAt: '2024-07-22' },
  { id: 'sc-4-2', studentId: 'std-4', columnId: 'col-form-1', nilai: 86, catatan: 'Bagus dalam menggambar preparat', updatedAt: '2024-08-05' },
  { id: 'sc-4-3', studentId: 'std-4', columnId: 'col-form-2', nilai: 88, catatan: 'Kerja sama tim sangat baik', updatedAt: '2024-08-20' },
  { id: 'sc-4-4', studentId: 'std-4', columnId: 'col-form-3', nilai: 84, catatan: 'Tuntas pada tes formatif', updatedAt: '2024-09-02' },
  { id: 'sc-4-5', studentId: 'std-4', columnId: 'col-sum-1', nilai: 87, catatan: 'Tuntas sumatif bab 1', updatedAt: '2024-08-28' },
  { id: 'sc-4-6', studentId: 'std-4', columnId: 'col-sum-2', nilai: 85, catatan: 'Tuntas sumatif bab 2', updatedAt: '2024-09-18' },
  { id: 'sc-4-7', studentId: 'std-4', columnId: 'col-sts-1', nilai: 86, catatan: 'Konsisten', updatedAt: '2024-10-02' },
  { id: 'sc-4-8', studentId: 'std-4', columnId: 'col-sas-1', nilai: 89, catatan: 'Prestasi sangat baik', updatedAt: '2024-12-04' },

  // Dimas Arya Putra (Beberapa belum dinilai untuk menunjukkan validasi "Belum Dinilai")
  { id: 'sc-5-1', studentId: 'std-5', columnId: 'col-diag-1', nilai: 75, catatan: 'Cukup siap', updatedAt: '2024-07-22' },
  { id: 'sc-5-2', studentId: 'std-5', columnId: 'col-form-1', nilai: 78, catatan: 'Praktikum lancar', updatedAt: '2024-08-05' },
  { id: 'sc-5-3', studentId: 'std-5', columnId: 'col-form-2', nilai: null, catatan: 'Izin sakit', updatedAt: '2024-08-20' },
  { id: 'sc-5-4', studentId: 'std-5', columnId: 'col-form-3', nilai: 80, catatan: 'Tuntas', updatedAt: '2024-09-02' },
  { id: 'sc-5-5', studentId: 'std-5', columnId: 'col-sum-1', nilai: 79, catatan: 'Tuntas', updatedAt: '2024-08-28' },
  { id: 'sc-5-6', studentId: 'std-5', columnId: 'col-sum-2', nilai: 80, catatan: 'Tuntas', updatedAt: '2024-09-18' },
  { id: 'sc-5-7', studentId: 'std-5', columnId: 'col-sts-1', nilai: 82, catatan: 'Tuntas', updatedAt: '2024-10-02' },
  { id: 'sc-5-8', studentId: 'std-5', columnId: 'col-sas-1', nilai: null, catatan: 'Susulan dijadwalkan', updatedAt: '2024-12-04' },
];

export function getStoredProfile(): SchoolProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading school profile from storage', e);
  }
  return DEFAULT_PROFILE;
}

export function saveStoredProfile(profile: SchoolProfile): void {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
}

export function getStoredWeights(): AssessmentWeight {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEIGHTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading weights from storage', e);
  }
  return DEFAULT_WEIGHTS;
}

export function saveStoredWeights(weights: AssessmentWeight): void {
  localStorage.setItem(STORAGE_KEYS.WEIGHTS, JSON.stringify(weights));
}

export function getStoredStudents(): Student[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading students from storage', e);
  }
  return INITIAL_STUDENTS;
}

export function saveStoredStudents(students: Student[]): void {
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
}

export function getStoredColumns(): AssessmentColumn[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COLUMNS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading columns from storage', e);
  }
  return INITIAL_COLUMNS;
}

export function saveStoredColumns(columns: AssessmentColumn[]): void {
  localStorage.setItem(STORAGE_KEYS.COLUMNS, JSON.stringify(columns));
}

export function getStoredScores(): AssessmentScore[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCORES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading scores from storage', e);
  }
  return INITIAL_SCORES;
}

export function saveStoredScores(scores: AssessmentScore[]): void {
  localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(scores));
}

export function resetAllDataToDefault(): void {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
  localStorage.setItem(STORAGE_KEYS.WEIGHTS, JSON.stringify(DEFAULT_WEIGHTS));
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
  localStorage.setItem(STORAGE_KEYS.COLUMNS, JSON.stringify(INITIAL_COLUMNS));
  localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(INITIAL_SCORES));
}

export function clearAllStudentsAndScores(): void {
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify([]));
}

export function exportFullBackup(): string {
  const data = {
    appName: 'APLIKASI TABEL PENILAIAN GURU',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    profile: getStoredProfile(),
    weights: getStoredWeights(),
    students: getStoredStudents(),
    columns: getStoredColumns(),
    scores: getStoredScores(),
  };
  return JSON.stringify(data, null, 2);
}

export function importFullBackup(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.profile) saveStoredProfile(parsed.profile);
    if (parsed.weights) saveStoredWeights(parsed.weights);
    if (parsed.students && Array.isArray(parsed.students)) saveStoredStudents(parsed.students);
    if (parsed.columns && Array.isArray(parsed.columns)) saveStoredColumns(parsed.columns);
    if (parsed.scores && Array.isArray(parsed.scores)) saveStoredScores(parsed.scores);
    return true;
  } catch (err) {
    console.error('Failed to import backup JSON', err);
    return false;
  }
}
