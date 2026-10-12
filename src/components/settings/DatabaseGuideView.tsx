import React, { useState } from 'react';
import {
  Database,
  Cloud,
  HardDrive,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Copy,
  Check,
  Key,
  Users,
  Lock,
  FileCode,
  Layers,
  HelpCircle,
} from 'lucide-react';

export const DatabaseGuideView: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const sampleFirebaseConfig = `// src/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);`;

  const sampleSecurityRules = `// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Setiap guru hanya dapat membaca dan menulis data kelas dan siswanya sendiri
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /classes/{classId}/students/{studentId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /classes/{classId}/assessments/{assessmentId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /classes/{classId}/scores/{scoreId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}`;

  return (
    <div className="space-y-6 text-xs">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              <span>Status Penyimpanan Data, Privasi & Panduan Cloud Database</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Penjelasan resmi mengenai model penyimpanan offline saat ini, pemisahan data antar-guru, perlindungan data pribadi siswa, serta petunjuk integrasi database Firebase untuk penggunaan lintas perangkat.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Status Penyimpanan Saat Ini */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-800">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Penyimpanan Lokal Aktif (Offline-First)</h3>
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Status: Bekerja Secara Mandiri
              </span>
            </div>
          </div>

          <p className="text-slate-600 leading-relaxed">
            Aplikasi saat ini menggunakan <strong>Penyimpanan Lokal Terisolasi (HTML5 Web Storage)</strong>.
            Setiap kali Anda menambah siswa, mengedit nilai, atau mengubah bobot, data langsung disimpan secara instan di peramban.
          </p>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-[11px] text-slate-700">
            <p className="font-semibold text-slate-800">Karakteristik & Batasan Penyimpanan Lokal:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>Data <strong>tidak akan hilang</strong> saat halaman dimuat ulang (refresh) atau komputer dimatikan.</li>
              <li>Data <strong>hanya tersedia pada perangkat dan peramban (browser)</strong> yang sedang Anda gunakan saat ini.</li>
              <li>Data tidak dikirim ke internet, menjaga kerahasiaan data siswa secara optimal.</li>
              <li>Untuk memindahkan data ke komputer atau laptop lain: gunakan fitur <strong>Cadangkan File JSON</strong> pada menu Pengaturan lalu pulihkan di laptop baru.</li>
            </ul>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-indigo-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-indigo-800">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Opsi Database Cloud (Firebase Firestore)</h3>
              <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                Status: Tersedia untuk Dikonfigurasi
              </span>
            </div>
          </div>

          <p className="text-slate-600 leading-relaxed">
            Untuk mengizinkan sinkronisasi antar-perangkat (misalnya input nilai dari HP di kelas lalu cetak dari PC di ruang guru), database cloud seperti <strong>Google Firebase Firestore</strong> dapat dihubungkan.
          </p>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-[11px] text-slate-700">
            <p className="font-semibold text-slate-800">Pemisahan Akses Multi-Guru (RBAC):</p>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>Setiap guru masuk menggunakan Akun Google / Email pribadi.</li>
              <li>Sistem memisahkan database tiap sekolah, mata pelajaran, dan kelas.</li>
              <li>Guru lain tidak dapat melihat atau mengubah buku nilai rekan guru lainnya kecuali diberikan izin kolaboratif.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 2. Perlindungan Privasi Peserta Didik */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-900">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-sm">Prinsip Perlindungan Data Pribadi Siswa (Data Privacy)</h3>
        </div>
        <p className="text-slate-600 leading-relaxed">
          Sesuai ketentuan perlindungan data pribadi pendidikan:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="font-bold text-slate-800">Data Contoh Fiktif</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Data bawaan awal merupakan data simulasi fiktif untuk tujuan demonstrasi fitur. Anda dapat mengosongkannya sewaktu-waktu di menu <em>Daftar Siswa</em>.
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="font-bold text-slate-800">Kerahasiaan NISN & Nilai</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Data nilai hanya tersimpan di browser Anda dan tidak pernah dibagikan atau dipublikasikan secara publik.
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="font-bold text-slate-800">Hak Kendali Penuh Guru</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Guru memiliki hak penuh untuk mencadangkan, menghapus, atau mereset seluruh data tanpa meninggalkan jejak di server pihak ketiga.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Langkah Pengujian Fitur (Testing Checklist) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Panduan & Langkah Pengujian Setiap Fitur Aplikasi</span>
          </h3>
          <span className="text-[11px] text-slate-500">8 Titik Uji Fungsional</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">1</span>
              <span>Uji Single Source of Truth Siswa</span>
            </div>
            <p className="text-slate-600 pl-7">
              Buka menu <strong>Daftar Siswa</strong>, tambahkan 1 siswa baru. Lalu buka kelima menu penilaian: siswa tersebut otomatis muncul di setiap tabel tanpa perlu diinput ulang!
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">2</span>
              <span>Uji Impor Data dari Excel / CSV</span>
            </div>
            <p className="text-slate-600 pl-7">
              Buka menu <strong>Daftar Siswa</strong> &gt; klik <em>Impor Excel / CSV</em>. Anda dapat menyalin data baris kolom dari tabel Microsoft Excel dan langsung menempelkannya (paste).
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">3</span>
              <span>Uji Validasi Rentang Nilai (0–100)</span>
            </div>
            <p className="text-slate-600 pl-7">
              Pada tabel penilaian mana pun, coba ketikkan angka di luar rentang (seperti 105 atau -10). Sistem akan menolak dan memunculkan notifikasi kesalahan yang jelas.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">4</span>
              <span>Uji Penanganan "Belum Dinilai"</span>
            </div>
            <p className="text-slate-600 pl-7">
              Hapus nilai seorang siswa sehingga kosong. Tabel akan menampilkan teks <em>"Belum Dinilai"</em>, bukan angka nol (0), sehingga rata-rata kelas tidak terdistorsi.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">5</span>
              <span>Uji Isolasi Nilai Diagnostik</span>
            </div>
            <p className="text-slate-600 pl-7">
              Ubah nilai pada menu <strong>Penilaian Diagnostik</strong>. Buka <strong>Rekap Kelas (Ledger)</strong>: nilai akhir rapor tetap independen dan tidak dipengaruhi nilai diagnostik.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">6</span>
              <span>Uji Kustomisasi Bobot Penilaian</span>
            </div>
            <p className="text-slate-600 pl-7">
              Buka menu <strong>Rekap Kelas</strong> &gt; klik <em>Atur Bobot Penilaian</em>. Ubah komposisi bobot (misal Formatif 40%, SAS 30%), nilai akhir seluruh kelas langsung terhitung ulang.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">7</span>
              <span>Uji Cetak Rapor & Ekspor PDF</span>
            </div>
            <p className="text-slate-600 pl-7">
              Buka menu <strong>Rapor Individu Siswa</strong> &gt; klik <em>Cetak Rapor Siswa</em>. Muncul dialog cetak browser dengan Kop Surat resmi, tanda tangan guru & orang tua tanpa tombol UI yang mengganggu.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">8</span>
              <span>Uji Ketahanan Muat Ulang (Reload Test)</span>
            </div>
            <p className="text-slate-600 pl-7">
              Lakukan refresh peramban (tekan Ctrl+R / F5). Seluruh daftar siswa, nilai yang baru diinput, dan konfigurasi bobot tetap tersimpan sempurna tanpa hilang.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Kode & Konfigurasi Firebase untuk Deployment Multi-Guru */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-indigo-600" />
              <span>Petunjuk Teknis Integrasi Cloud Firebase (Bagi Administrator Sekolah)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Kode dan Security Rules Firestore untuk pemisahan data setiap guru
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-700">1. Konfigurasi SDK Firebase (TypeScript)</span>
              <button
                onClick={() => copyToClipboard(sampleFirebaseConfig, 'sdk')}
                className="flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800"
              >
                {copiedCode === 'sdk' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode === 'sdk' ? 'Tersalin' : 'Salin Kode'}</span>
              </button>
            </div>
            <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto">
              {sampleFirebaseConfig}
            </pre>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-700">2. Aturan Keamanan Firestore (Security Rules Pemisahan Guru)</span>
              <button
                onClick={() => copyToClipboard(sampleSecurityRules, 'rules')}
                className="flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800"
              >
                {copiedCode === 'rules' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode === 'rules' ? 'Tersalin' : 'Salin Aturan'}</span>
              </button>
            </div>
            <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto">
              {sampleSecurityRules}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
