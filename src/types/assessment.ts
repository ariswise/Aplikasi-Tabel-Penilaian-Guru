/**
 * Tipe data untuk Aplikasi Tabel Penilaian Guru
 */

export type AssessmentType = 'diagnostik' | 'formatif' | 'sumatif_materi' | 'sts' | 'sas';

export type PredicateGrade = 'A' | 'B' | 'C' | 'D';

export interface PredicateRange {
  min: number;
  max: number;
  predikat: PredicateGrade;
  keterangan: string;
}

export interface SchoolProfile {
  namaSekolah: string;
  npsn: string;
  alamat: string;
  kepalaSekolah: string;
  nipKepalaSekolah: string;
  namaGuru: string;
  nipGuru: string;
  mataPelajaran: string;
  fase: string;
  kelas: string;
  semester: '1 (Ganjil)' | '2 (Genap)';
  tahunAjaran: string;
  kktp: number; // Kriteria Ketercapaian Tujuan Pembelajaran (default misal 75)
  rentangPredikat: {
    A: { min: number; max: number; label: string };
    B: { min: number; max: number; label: string };
    C: { min: number; max: number; label: string };
    D: { min: number; max: number; label: string };
  };
}

export interface AssessmentWeight {
  formatif: number;      // misal 30%
  sumatifMateri: number; // misal 30%
  sts: number;           // misal 20%
  sas: number;           // misal 20%
  // Nilai diagnostik tidak masuk bobot nilai akhir rapor!
}

export interface Student {
  id: string;
  nisn: string;
  nis: string;
  nama: string;
  jenisKelamin: 'L' | 'P';
  kelas: string;
  status: 'Aktif' | 'Nonaktif';
}

export interface AssessmentColumn {
  id: string;
  type: AssessmentType;
  kode: string; // misal 'TP 1.1', 'STS-1', 'SAS Ganjil'
  namaMateri: string; // Deskripsi materi/tujuan pembelajaran
  tanggal: string; // YYYY-MM-DD
  kktpKhusus?: number; // jika ada KKTP spesifik materi
  jenisDiagnostik?: 'Kognitif' | 'Non-Kognitif'; // khusus diagnostik
  keterangan?: string;
}

export interface AssessmentScore {
  id: string;
  studentId: string;
  columnId: string;
  nilai: number | null; // null = Belum Dinilai
  catatan?: string;
  remedialNilai?: number | null;
  tindakLanjut?: 'Pengayaan' | 'Remedial' | 'Reguler' | 'Tercapai';
  updatedAt: string;
}

export interface FinalGradeSummary {
  student: Student;
  rataFormatif: number | null;
  rataSumatifMateri: number | null;
  nilaiSTS: number | null;
  nilaiSAS: number | null;
  nilaiAkhir: number | null;
  predikat: PredicateGrade | '-';
  status: 'Tuntas' | 'Belum Tuntas' | 'Belum Lengkap';
  capaianTertinggi?: string;
  capaianPerluBimbingan?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}
