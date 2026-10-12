import React, { useState } from 'react';
import { AssessmentWeight, SchoolProfile } from '../../types/assessment';
import {
  Building2,
  User,
  GraduationCap,
  Calendar,
  Layers,
  Save,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { exportFullBackup, importFullBackup, resetAllDataToDefault } from '../../utils/storage';

interface SchoolSettingsViewProps {
  profile: SchoolProfile;
  weights: AssessmentWeight;
  onUpdateProfile: (profile: SchoolProfile) => void;
  onUpdateWeights: (weights: AssessmentWeight) => void;
  onReloadAllData: () => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

export const SchoolSettingsView: React.FC<SchoolSettingsViewProps> = ({
  profile,
  weights,
  onUpdateProfile,
  onUpdateWeights,
  onReloadAllData,
  onShowToast,
}) => {
  const [formData, setFormData] = useState<SchoolProfile>(profile);
  const [formWeights, setFormWeights] = useState<AssessmentWeight>(weights);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    onShowToast('Identitas Sekolah Disimpan', 'Data sekolah dan guru berhasil diperbarui.');
  };

  const handleSaveWeights = (e: React.FormEvent) => {
    e.preventDefault();
    const sum =
      Number(formWeights.formatif) +
      Number(formWeights.sumatifMateri) +
      Number(formWeights.sts) +
      Number(formWeights.sas);

    if (sum !== 100) {
      onShowToast(
        'Bobot Harus Berjumlah 100%',
        `Saat ini total bobot adalah ${sum}%. Harap sesuaikan kembali.`,
        'error'
      );
      return;
    }

    onUpdateWeights(formWeights);
    onShowToast('Bobot Penilaian Disimpan', 'Konfigurasi bobot nilai akhir berhasil disimpan.');
  };

  const handleBackupDownload = () => {
    const backupJson = exportFullBackup();
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cadangan_Tabel_Penilaian_Guru_${formData.kelas}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast('Cadangan Berhasil Diunduh', 'File JSON cadangan telah disimpan di komputer Anda.');
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importFullBackup(content);
      if (success) {
        onReloadAllData();
        onShowToast('Pemulihan Sukses', 'Semua data penilaian berhasil dipulihkan dari file JSON.');
      } else {
        onShowToast('Gagal Memulihkan', 'Format file cadangan JSON tidak valid.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleResetToDefault = () => {
    resetAllDataToDefault();
    onReloadAllData();
    setShowResetConfirm(false);
    onShowToast('Data Direset', 'Aplikasi telah dikembalikan ke data default.');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-base font-bold text-slate-900">
          Pengaturan Identitas Sekolah, Guru & Konfigurasi Kurikulum
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Informasi ini akan dicantumkan secara otomatis pada lembar penilaian, kop surat cetak, rapor siswa, dan ledger kelas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FORM IDENTITAS SEKOLAH & GURU (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <form
            onSubmit={handleSaveProfile}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>Identitas Satuan Pendidikan & Mata Pelajaran</span>
              </h3>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </button>
            </div>

            {/* School Profile Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Satuan Pendidikan / Sekolah <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.namaSekolah}
                  onChange={(e) => setFormData({ ...formData, namaSekolah: e.target.value })}
                  placeholder="Contoh: SMP Negeri 1 Merdeka"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nomor Pokok Sekolah Nasional (NPSN)
                </label>
                <input
                  type="text"
                  value={formData.npsn}
                  onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                  placeholder="Contoh: 20108992"
                  className="w-full p-2.5 font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Alamat Lengkap Sekolah
                </label>
                <input
                  type="text"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  placeholder="Contoh: Jl. Pendidikan No. 45, Kecamatan Gambir, Jakarta Pusat"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Kepala Sekolah <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.kepalaSekolah}
                  onChange={(e) => setFormData({ ...formData, kepalaSekolah: e.target.value })}
                  placeholder="Contoh: Dr. Budi Santoso, M.Pd."
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  NIP Kepala Sekolah
                </label>
                <input
                  type="text"
                  value={formData.nipKepalaSekolah}
                  onChange={(e) => setFormData({ ...formData, nipKepalaSekolah: e.target.value })}
                  placeholder="Contoh: 19720512 199803 1 003"
                  className="w-full p-2.5 font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Guru Pengampu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.namaGuru}
                  onChange={(e) => setFormData({ ...formData, namaGuru: e.target.value })}
                  placeholder="Contoh: Siti Rahmawati, S.Pd."
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  NIP Guru Pengampu
                </label>
                <input
                  type="text"
                  value={formData.nipGuru}
                  onChange={(e) => setFormData({ ...formData, nipGuru: e.target.value })}
                  placeholder="Contoh: 19870814 201101 2 009"
                  className="w-full p-2.5 font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mata Pelajaran <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.mataPelajaran}
                  onChange={(e) => setFormData({ ...formData, mataPelajaran: e.target.value })}
                  placeholder="Contoh: Ilmu Pengetahuan Alam (IPA)"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kelas / Rombel
                </label>
                <input
                  type="text"
                  required
                  value={formData.kelas}
                  onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                  placeholder="Contoh: VII A / X MIPA 1"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Fase (Kurikulum Merdeka)
                </label>
                <select
                  value={formData.fase}
                  onChange={(e) => setFormData({ ...formData, fase: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Fase Fondasi (PAUD/TK)">Fase Fondasi (PAUD/TK)</option>
                  <option value="Fase A (Kelas 1-2 SD)">Fase A (Kelas 1-2 SD)</option>
                  <option value="Fase B (Kelas 3-4 SD)">Fase B (Kelas 3-4 SD)</option>
                  <option value="Fase C (Kelas 5-6 SD)">Fase C (Kelas 5-6 SD)</option>
                  <option value="Fase D (Kelas 7-9 SMP)">Fase D (Kelas 7-9 SMP)</option>
                  <option value="Fase E (Kelas 10 SMA/SMK)">Fase E (Kelas 10 SMA/SMK)</option>
                  <option value="Fase F (Kelas 11-12 SMA/SMK)">Fase F (Kelas 11-12 SMA/SMK)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tahun Ajaran & Semester
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formData.tahunAjaran}
                    onChange={(e) => setFormData({ ...formData, tahunAjaran: e.target.value })}
                    placeholder="2024/2025"
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value as any })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="1 (Ganjil)">1 (Ganjil)</option>
                    <option value="2 (Genap)">2 (Genap)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* KKTP and Predicate Scale */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="font-bold text-slate-800 mb-3">
                Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) & Rentang Predikat
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">KKTP Minimum</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.kktp}
                    onChange={(e) => setFormData({ ...formData, kktp: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold font-mono text-indigo-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Predikat A</label>
                  <input
                    type="text"
                    disabled
                    value={`${formData.rentangPredikat.A.min} - ${formData.rentangPredikat.A.max}`}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono text-slate-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Predikat B</label>
                  <input
                    type="text"
                    disabled
                    value={`${formData.rentangPredikat.B.min} - ${formData.rentangPredikat.B.max}`}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono text-slate-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Predikat C & D</label>
                  <input
                    type="text"
                    disabled
                    value={`C: ${formData.rentangPredikat.C.min}–${formData.rentangPredikat.C.max} | D: <${formData.rentangPredikat.C.min}`}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono text-slate-600"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: BOBOT & DATA MANAGEMENT */}
        <div className="space-y-6 text-xs">
          {/* Bobot Nilai Akhir Card */}
          <form
            onSubmit={handleSaveWeights}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span>Bobot Penilaian Nilai Akhir</span>
              </h3>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Atur persentase kontribusi masing-masing komponen penilaian pada nilai akhir rapor siswa (Total harus 100%).
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Penilaian Diagnostik:</span>
                <span className="font-mono text-slate-400 font-bold">0% (Tidak masuk NA)</span>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Penilaian Formatif (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formWeights.formatif}
                  onChange={(e) =>
                    setFormWeights({ ...formWeights, formatif: Number(e.target.value) })
                  }
                  className="w-full p-2 border border-slate-300 rounded-xl font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Sumatif Akhir Materi (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formWeights.sumatifMateri}
                  onChange={(e) =>
                    setFormWeights({ ...formWeights, sumatifMateri: Number(e.target.value) })
                  }
                  className="w-full p-2 border border-slate-300 rounded-xl font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Sumatif Tengah Semester (STS) (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formWeights.sts}
                  onChange={(e) =>
                    setFormWeights({ ...formWeights, sts: Number(e.target.value) })
                  }
                  className="w-full p-2 border border-slate-300 rounded-xl font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Sumatif Akhir Semester (SAS) (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formWeights.sas}
                  onChange={(e) =>
                    setFormWeights({ ...formWeights, sas: Number(e.target.value) })
                  }
                  className="w-full p-2 border border-slate-300 rounded-xl font-bold font-mono"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="font-semibold text-slate-600">
                Total:{' '}
                <strong
                  className={
                    Number(formWeights.formatif) +
                      Number(formWeights.sumatifMateri) +
                      Number(formWeights.sts) +
                      Number(formWeights.sas) ===
                    100
                      ? 'text-emerald-700'
                      : 'text-rose-600'
                  }
                >
                  {Number(formWeights.formatif) +
                    Number(formWeights.sumatifMateri) +
                    Number(formWeights.sts) +
                    Number(formWeights.sas)}
                  %
                </strong>
              </span>

              <button
                type="submit"
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
              >
                Terapkan Bobot
              </button>
            </div>
          </form>

          {/* Backup, Restore & Reset Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Cadangkan & Pulihkan Data</span>
            </h3>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Unduh cadangan data lengkap (seluruh siswa, nilai 5 menu, dan pengaturan) ke komputer Anda untuk keamanan atau pemindahan perangkat.
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleBackupDownload}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File Cadangan JSON</span>
              </button>

              <label className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Pulihkan dari File JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestoreBackup}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl border border-rose-200 transition-colors mt-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset ke Data Awal Default</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs no-print text-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900">Kembalikan ke Pengaturan Default?</h4>
            <p className="text-slate-600 mt-1">
              Data penilaian dan siswa saat ini akan digantikan dengan data contoh bawaan sistem. Pastikan Anda telah mengunduh file cadangan jika masih membutuhkan data saat ini.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                onClick={handleResetToDefault}
                className="px-4 py-1.5 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
