/**
 * APLIKASI TABEL PENILAIAN GURU
 * Aplikasi web profesional pengelolaan tabel penilaian guru untuk semua jenjang dan mata pelajaran.
 * Sesuai Kurikulum Merdeka & Kurikulum Nasional.
 */

import React, { useState, useEffect } from 'react';
import {
  AssessmentColumn,
  AssessmentScore,
  AssessmentWeight,
  SchoolProfile,
  Student,
  ToastMessage,
} from './types/assessment';
import {
  getStoredProfile,
  getStoredWeights,
  getStoredStudents,
  getStoredColumns,
  getStoredScores,
  saveStoredProfile,
  saveStoredWeights,
  saveStoredStudents,
  saveStoredColumns,
  saveStoredScores,
  exportFullBackup,
  clearAllStudentsAndScores,
} from './utils/storage';
import { Header } from './components/layout/Header';
import { Sidebar, NavigationTab } from './components/layout/Sidebar';
import { ToastNotification } from './components/common/ToastNotification';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { StudentManagement } from './components/students/StudentManagement';
import { AssessmentTableView } from './components/assessments/AssessmentTableView';
import { ClassRekapView } from './components/rekap/ClassRekapView';
import { StudentIndividualRekap } from './components/rekap/StudentIndividualRekap';
import { LearningAnalysisView } from './components/analysis/LearningAnalysisView';
import { FollowUpRemedialView } from './components/analysis/FollowUpRemedialView';
import { SchoolSettingsView } from './components/settings/SchoolSettingsView';
import { DatabaseGuideView } from './components/settings/DatabaseGuideView';

export default function App() {
  // Master state
  const [profile, setProfile] = useState<SchoolProfile>(getStoredProfile);
  const [weights, setWeights] = useState<AssessmentWeight>(getStoredWeights);
  const [students, setStudents] = useState<Student[]>(getStoredStudents);
  const [columns, setColumns] = useState<AssessmentColumn[]>(getStoredColumns);
  const [scores, setScores] = useState<AssessmentScore[]>(getStoredScores);

  // UI state
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<string | undefined>(undefined);

  // Sync state to LocalStorage
  useEffect(() => {
    saveStoredProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveStoredWeights(weights);
  }, [weights]);

  useEffect(() => {
    saveStoredStudents(students);
  }, [students]);

  useEffect(() => {
    saveStoredColumns(columns);
  }, [columns]);

  useEffect(() => {
    saveStoredScores(scores);
  }, [scores]);

  // Toast notification helper
  const showToast = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'info' = 'success'
  ) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Score management
  const handleUpdateScore = (
    studentId: string,
    columnId: string,
    nilai: number | null,
    catatan?: string
  ) => {
    setScores((prevScores) => {
      const existingIdx = prevScores.findIndex(
        (s) => s.studentId === studentId && s.columnId === columnId
      );

      const now = new Date().toISOString();

      if (existingIdx >= 0) {
        const updated = [...prevScores];
        updated[existingIdx] = {
          ...updated[existingIdx],
          nilai,
          catatan: catatan !== undefined ? catatan : updated[existingIdx].catatan,
          updatedAt: now,
        };
        return updated;
      } else {
        const newScore: AssessmentScore = {
          id: `sc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          studentId,
          columnId,
          nilai,
          catatan: catatan || '',
          updatedAt: now,
        };
        return [...prevScores, newScore];
      }
    });
  };

  // Assessment column management
  const handleAddColumn = (column: AssessmentColumn) => {
    setColumns((prev) => [...prev, column]);
  };

  const handleDeleteColumn = (columnId: string) => {
    setColumns((prev) => prev.filter((c) => c.id !== columnId));
    setScores((prev) => prev.filter((s) => s.columnId !== columnId));
  };

  // Student management
  const handleAddStudent = (student: Student) => {
    setStudents((prev) => [...prev, student]);
    showToast('Siswa Ditambahkan', `${student.nama} berhasil dimasukkan ke daftar.`);
  };

  const handleUpdateStudent = (student: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === student.id ? student : s)));
    showToast('Data Siswa Diperbarui', `Perubahan data ${student.nama} telah disimpan.`);
  };

  const handleDeleteStudent = (studentId: string) => {
    const target = students.find((s) => s.id === studentId);
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    setScores((prev) => prev.filter((s) => s.studentId !== studentId));
    showToast('Siswa Dihapus', `${target?.nama || 'Siswa'} telah dihapus.`);
  };

  const handleImportStudents = (newStudents: Student[]) => {
    setStudents((prev) => {
      // Append non-duplicate NISN
      const existingNisns = new Set(prev.map((s) => s.nisn).filter(Boolean));
      const filteredNew = newStudents.filter((s) => s.nisn === '-' || !existingNisns.has(s.nisn));
      return [...prev, ...filteredNew];
    });
    showToast('Impor Siswa Berhasil', `${newStudents.length} siswa berhasil ditambahkan.`);
  };

  const handleClearAllStudents = () => {
    clearAllStudentsAndScores();
    setStudents([]);
    setScores([]);
    showToast('Data Siswa Dikosongkan', 'Seluruh data siswa dan nilai telah dibersihkan.');
  };

  // Reload all from storage (after JSON restore or reset)
  const handleReloadAllData = () => {
    setProfile(getStoredProfile());
    setWeights(getStoredWeights());
    setStudents(getStoredStudents());
    setColumns(getStoredColumns());
    setScores(getStoredScores());
  };

  // Quick backup action from header
  const handleQuickBackup = () => {
    const backupJson = exportFullBackup();
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cadangan_Tabel_Penilaian_Guru_${profile.kelas}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Cadangan Diunduh', 'File JSON telah disimpan ke perangkat Anda.');
  };

  const getTabTitle = (tab: NavigationTab): string => {
    switch (tab) {
      case 'dashboard':
        return 'Dashboard Ringkasan';
      case 'students':
        return 'Daftar Peserta Didik (Master Siswa)';
      case 'diagnostik':
        return 'Penilaian Diagnostik (Awal Pembelajaran)';
      case 'formatif':
        return 'Penilaian Formatif (Proses / TP)';
      case 'sumatif_materi':
        return 'Sumatif Akhir Lingkup Materi';
      case 'sts':
        return 'Sumatif Tengah Semester (STS)';
      case 'sas':
        return 'Sumatif Akhir Semester (SAS)';
      case 'rekap_kelas':
        return 'Rekapitulasi Nilai Kelas (Ledger Rapor)';
      case 'rekap_individu':
        return 'Rapor Hasil Belajar Individu Siswa';
      case 'analisis':
        return 'Analisis Hasil Belajar & Grafik';
      case 'tindak_lanjut':
        return 'Tindak Lanjut Remedial & Pengayaan';
      case 'pengaturan':
        return 'Pengaturan Identitas & Bobot';
      case 'panduan_db':
        return 'Panduan Database & Perlindungan Privasi';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Header Bar */}
      <Header
        profile={profile}
        activeTabTitle={getTabTitle(activeTab)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenDatabaseGuide={() => setActiveTab('panduan_db')}
        onQuickBackup={handleQuickBackup}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          studentCount={students.length}
        />

        {/* Dynamic Main Workspace Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* 1. Dashboard Overview */}
          {activeTab === 'dashboard' && (
            <DashboardOverview
              students={students}
              columns={columns}
              scores={scores}
              profile={profile}
              weights={weights}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {/* 2. Master Student Management */}
          {activeTab === 'students' && (
            <StudentManagement
              students={students}
              currentClass={profile.kelas}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              onImportStudents={handleImportStudents}
              onClearAllStudents={handleClearAllStudents}
            />
          )}

          {/* 3. 5 CORE ASSESSMENT MENUS */}
          {/* Menu 1: Diagnostik */}
          {activeTab === 'diagnostik' && (
            <AssessmentTableView
              type="diagnostik"
              title="1. Penilaian Diagnostik (Awal Pembelajaran)"
              subtitle="Asesmen awal untuk memetakan kesiapan belajar, profil gaya belajar, dan minat peserta didik."
              students={students}
              columns={columns}
              scores={scores}
              profile={profile}
              onUpdateScore={handleUpdateScore}
              onAddColumn={handleAddColumn}
              onDeleteColumn={handleDeleteColumn}
              onShowToast={showToast}
            />
          )}

          {/* Menu 2: Formatif */}
          {activeTab === 'formatif' && (
            <AssessmentTableView
              type="formatif"
              title="2. Penilaian Formatif (Proses Pembelajaran)"
              subtitle="Penilaian berkala selama proses kegiatan belajar untuk setiap Tujuan Pembelajaran (TP)."
              students={students}
              columns={columns}
              scores={scores}
              profile={profile}
              onUpdateScore={handleUpdateScore}
              onAddColumn={handleAddColumn}
              onDeleteColumn={handleDeleteColumn}
              onShowToast={showToast}
            />
          )}

          {/* Menu 3: Sumatif Akhir Materi */}
          {activeTab === 'sumatif_materi' && (
            <AssessmentTableView
              type="sumatif_materi"
              title="3. Sumatif Akhir Lingkup Materi"
              subtitle="Asesmen sumatif pada akhir setiap materi / bab untuk mengukur ketuntasan kompetensi."
              students={students}
              columns={columns}
              scores={scores}
              profile={profile}
              onUpdateScore={handleUpdateScore}
              onAddColumn={handleAddColumn}
              onDeleteColumn={handleDeleteColumn}
              onShowToast={showToast}
            />
          )}

          {/* Menu 4: STS */}
          {activeTab === 'sts' && (
            <AssessmentTableView
              type="sts"
              title="4. Sumatif Tengah Semester (STS)"
              subtitle="Penilaian evaluasi pertengahan semester untuk mengukur ketercapaian materi terpadu."
              students={students}
              columns={columns}
              scores={scores}
              profile={profile}
              onUpdateScore={handleUpdateScore}
              onAddColumn={handleAddColumn}
              onDeleteColumn={handleDeleteColumn}
              onShowToast={showToast}
            />
          )}

          {/* Menu 5: SAS */}
          {activeTab === 'sas' && (
            <AssessmentTableView
              type="sas"
              title="5. Sumatif Akhir Semester (SAS / SAT)"
              subtitle="Asesmen komprehensif pada akhir semester atau akhir tahun penentu ketercapaian kurikulum."
              students={students}
              columns={columns}
              scores={scores}
              profile={profile}
              onUpdateScore={handleUpdateScore}
              onAddColumn={handleAddColumn}
              onDeleteColumn={handleDeleteColumn}
              onShowToast={showToast}
            />
          )}

          {/* 4. Rekap Kelas (Ledger Nilai Akhir) */}
          {activeTab === 'rekap_kelas' && (
            <ClassRekapView
              students={students}
              columns={columns}
              scores={scores}
              profile={profile}
              weights={weights}
              onUpdateWeights={(w) => setWeights(w)}
              onSelectStudentDetail={(studentId) => {
                setSelectedStudentForDetail(studentId);
                setActiveTab('rekap_individu');
              }}
              onShowToast={showToast}
            />
          )}

          {/* 5. Rapor Individu Siswa */}
          {activeTab === 'rekap_individu' && (
            <StudentIndividualRekap
              students={students}
              columns={columns}
              scores={scores}
              profile={profile}
              weights={weights}
              initialStudentId={selectedStudentForDetail}
            />
          )}

          {/* 6. Analisis Hasil Belajar & Grafik */}
          {activeTab === 'analisis' && (
            <LearningAnalysisView
              students={students}
              columns={columns}
              scores={scores}
              profile={profile}
              weights={weights}
              onNavigateToRemedial={() => setActiveTab('tindak_lanjut')}
            />
          )}

          {/* 7. Tindak Lanjut Remedial & Pengayaan */}
          {activeTab === 'tindak_lanjut' && (
            <FollowUpRemedialView
              students={students}
              columns={columns}
              scores={scores}
              profile={profile}
              onUpdateScore={handleUpdateScore}
              onShowToast={showToast}
            />
          )}

          {/* 8. Pengaturan Identitas & Bobot */}
          {activeTab === 'pengaturan' && (
            <SchoolSettingsView
              profile={profile}
              weights={weights}
              onUpdateProfile={(p) => setProfile(p)}
              onUpdateWeights={(w) => setWeights(w)}
              onReloadAllData={handleReloadAllData}
              onShowToast={showToast}
            />
          )}

          {/* 9. Panduan Database & Privasi */}
          {activeTab === 'panduan_db' && <DatabaseGuideView />}
        </main>
      </div>

      {/* Toast Notification Stack */}
      <ToastNotification toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
