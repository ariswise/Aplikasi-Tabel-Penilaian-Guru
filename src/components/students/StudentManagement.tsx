import React, { useState } from 'react';
import { Student } from '../../types/assessment';
import {
  UserPlus,
  Upload,
  Download,
  Search,
  Trash2,
  Edit2,
  ShieldAlert,
  Users,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';
import { ImportStudentModal } from './ImportStudentModal';
import { exportToCSV } from '../../utils/exportUtils';

interface StudentManagementProps {
  students: Student[];
  currentClass: string;
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onImportStudents: (newStudents: Student[]) => void;
  onClearAllStudents: () => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  students,
  currentClass,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onImportStudents,
  onClearAllStudents,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState<'ALL' | 'L' | 'P'>('ALL');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Form states for Add/Edit
  const [formData, setFormData] = useState({
    nisn: '',
    nis: '',
    nama: '',
    jenisKelamin: 'L' as 'L' | 'P',
    kelas: currentClass,
  });

  const handleOpenAddModal = () => {
    setFormData({
      nisn: '',
      nis: '',
      nama: '',
      jenisKelamin: 'L',
      kelas: currentClass,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      nisn: student.nisn,
      nis: student.nis,
      nama: student.nama,
      jenisKelamin: student.jenisKelamin,
      kelas: student.kelas,
    });
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim()) return;

    if (editingStudent) {
      onUpdateStudent({
        ...editingStudent,
        nisn: formData.nisn.trim() || '-',
        nis: formData.nis.trim() || '-',
        nama: formData.nama.trim(),
        jenisKelamin: formData.jenisKelamin,
        kelas: formData.kelas || currentClass,
      });
      setEditingStudent(null);
    } else {
      const newStudent: Student = {
        id: 'std-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        nisn: formData.nisn.trim() || '-',
        nis: formData.nis.trim() || '-',
        nama: formData.nama.trim(),
        jenisKelamin: formData.jenisKelamin,
        kelas: formData.kelas || currentClass,
        status: 'Aktif',
      };
      onAddStudent(newStudent);
      setIsAddModalOpen(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['No', 'NISN', 'NIS', 'Nama Lengkap', 'Jenis Kelamin', 'Kelas', 'Status'];
    const rows = filteredStudents.map((s, idx) => [
      idx + 1,
      s.nisn,
      s.nis,
      s.nama,
      s.jenisKelamin,
      s.kelas,
      s.status,
    ]);
    exportToCSV(`Daftar_Peserta_Didik_${currentClass}`, [headers, ...rows]);
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nis.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGender = filterGender === 'ALL' || s.jenisKelamin === filterGender;
    return matchesSearch && matchesGender;
  });

  const maleCount = students.filter((s) => s.jenisKelamin === 'L').length;
  const femaleCount = students.filter((s) => s.jenisKelamin === 'P').length;

  return (
    <div className="space-y-6">
      {/* Privacy Notice Banner */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 no-print">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed flex-1">
          <p className="font-semibold text-amber-950">
            Perlindungan Privasi Peserta Didik (Data Privacy Notice)
          </p>
          <p className="mt-0.5">
            Daftar siswa disimpan <strong>hanya di peramban (browser) perangkat ini</strong> dan tidak diunggah ke pihak ketiga tanpa konfigurasi akun Anda.
            Jika saat ini masih menggunakan data contoh, Anda dapat membersihkannya kapan saja dan mengimpor data asli kelas Anda secara aman.
          </p>
        </div>
        {students.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="shrink-0 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Kosongkan Siswa</span>
          </button>
        )}
      </div>

      {/* Header Cards & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Siswa Terdaftar</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{students.length}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Otomatis terhubung di 5 menu penilaian</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Laki-Laki (L)</p>
            <h3 className="text-2xl font-bold text-blue-600 mt-1">{maleCount}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {students.length ? Math.round((maleCount / students.length) * 100) : 0}% dari total kelas
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
            L
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Perempuan (P)</p>
            <h3 className="text-2xl font-bold text-rose-600 mt-1">{femaleCount}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {students.length ? Math.round((femaleCount / students.length) * 100) : 0}% dari total kelas
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-bold text-lg">
            P
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 no-print">
        {/* Search & Gender filter */}
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama, NISN, atau NIS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setFilterGender('ALL')}
              className={`px-3 py-1.5 font-medium rounded-lg transition-colors ${
                filterGender === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterGender('L')}
              className={`px-2.5 py-1.5 font-medium rounded-lg transition-colors ${
                filterGender === 'L' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              L
            </button>
            <button
              onClick={() => setFilterGender('P')}
              className={`px-2.5 py-1.5 font-medium rounded-lg transition-colors ${
                filterGender === 'P' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              P
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Impor Excel / CSV</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4 w-32">NISN</th>
                <th className="py-3 px-4 w-28">NIS</th>
                <th className="py-3 px-4">Nama Lengkap Peserta Didik</th>
                <th className="py-3 px-4 w-20 text-center">L/P</th>
                <th className="py-3 px-4 w-24 text-center">Kelas</th>
                <th className="py-3 px-4 w-28 text-center">Status</th>
                <th className="py-3 px-4 w-28 text-center no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600 text-sm">Tidak ada data siswa ditemukan</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Klik tombol <strong>Tambah Siswa</strong> atau <strong>Impor Excel/CSV</strong> untuk memulai.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{student.nisn || '-'}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{student.nis || '-'}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{student.nama}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 font-bold rounded-md text-[10px] ${
                          student.jenisKelamin === 'L'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {student.jenisKelamin}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-slate-600">{student.kelas}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {student.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center no-print">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(student)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Data Siswa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setStudentToDelete(student)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Student */}
      {(isAddModalOpen || editingStudent) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingStudent ? 'Edit Data Peserta Didik' : 'Tambah Peserta Didik Baru'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingStudent(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap Siswa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Farhan"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NISN</label>
                  <input
                    type="text"
                    placeholder="Contoh: 0091234501"
                    value={formData.nisn}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    className="w-full p-2.5 font-mono border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIS (Sekolah)</label>
                  <input
                    type="text"
                    placeholder="Contoh: 24001"
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full p-2.5 font-mono border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.jenisKelamin}
                    onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value as 'L' | 'P' })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="L">Laki-Laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kelas</label>
                  <input
                    type="text"
                    value={formData.kelas}
                    onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingStudent(null);
                  }}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingStudent ? 'Simpan Perubahan' : 'Tambahkan Siswa'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal Delete Single Student */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 text-xs">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Hapus Siswa dari Daftar?</h4>
            <p className="text-slate-600 mt-1 leading-relaxed">
              Apakah Anda yakin ingin menghapus <strong>{studentToDelete.nama}</strong>? Data nilai siswa ini pada seluruh tabel penilaian juga akan dibersihkan.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setStudentToDelete(null)}
                className="px-3.5 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 font-medium"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteStudent(studentToDelete.id);
                  setStudentToDelete(null);
                }}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold"
              >
                Hapus Siswa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal Clear All Students */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 text-xs">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Kosongkan Seluruh Data Siswa?</h4>
            <p className="text-slate-600 mt-1 leading-relaxed">
              Tindakan ini akan menghapus semua daftar siswa dan nilai yang ada agar Anda dapat mengisi data siswa kelas asli. Anda dapat mencadangkan data JSON terlebih dahulu jika dibutuhkan.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3.5 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 font-medium"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onClearAllStudents();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold"
              >
                Ya, Kosongkan Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      <ImportStudentModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={onImportStudents}
        currentClass={currentClass}
      />
    </div>
  );
};
