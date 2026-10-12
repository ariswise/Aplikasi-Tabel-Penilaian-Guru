import React from 'react';
import {
  LayoutDashboard,
  Users,
  Brain,
  FileSpreadsheet,
  Award,
  CalendarCheck2,
  GraduationCap,
  TableProperties,
  UserCheck,
  BarChart3,
  HelpCircle,
  Settings,
  X,
  Sparkles,
} from 'lucide-react';

export type NavigationTab =
  | 'dashboard'
  | 'students'
  | 'diagnostik'
  | 'formatif'
  | 'sumatif_materi'
  | 'sts'
  | 'sas'
  | 'rekap_kelas'
  | 'rekap_individu'
  | 'analisis'
  | 'tindak_lanjut'
  | 'pengaturan'
  | 'panduan_db';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isOpen: boolean;
  onClose: () => void;
  studentCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
  studentCount,
}) => {
  const assessmentItems: { id: NavigationTab; label: string; desc: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'diagnostik',
      label: '1. Penilaian Diagnostik',
      desc: 'Asesmen awal kognitif & non-kognitif',
      icon: <Brain className="w-4 h-4" />,
      badge: 'Awal',
    },
    {
      id: 'formatif',
      label: '2. Penilaian Formatif',
      desc: 'Penilaian proses belajar per TP',
      icon: <FileSpreadsheet className="w-4 h-4" />,
      badge: 'Proses',
    },
    {
      id: 'sumatif_materi',
      label: '3. Sumatif Akhir Materi',
      desc: 'Asesmen sumatif lingkup TP/Bab',
      icon: <Award className="w-4 h-4" />,
      badge: 'Materi',
    },
    {
      id: 'sts',
      label: '4. Sumatif Tengah Semester',
      desc: 'Penilaian STS pertengahan semester',
      icon: <CalendarCheck2 className="w-4 h-4" />,
      badge: 'STS',
    },
    {
      id: 'sas',
      label: '5. Sumatif Akhir Semester',
      desc: 'Penilaian SAS / SAT akhir semester',
      icon: <GraduationCap className="w-4 h-4" />,
      badge: 'SAS',
    },
  ];

  const handleNav = (tab: NavigationTab) => {
    onSelectTab(tab);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs no-print transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 no-print ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <TableProperties className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">Buku Nilai Guru</p>
              <p className="text-[11px] text-slate-400">Kurikulum Merdeka & Nasional</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 text-xs">
          {/* Section: Menu Utama */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Ringkasan & Siswa
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleNav('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-sm">Dashboard Utama</span>
              </button>

              <button
                onClick={() => handleNav('students')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                  activeTab === 'students'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-sm">Daftar Siswa (Master)</span>
                <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 font-mono">
                  {studentCount}
                </span>
              </button>
            </div>
          </div>

          {/* Section: 5 MENU PENILAIAN WAJIB */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-amber-400/90 flex items-center justify-between">
              <span>5 Menu Penilaian</span>
              <Sparkles className="w-3 h-3 text-amber-400" />
            </div>
            <div className="space-y-1">
              {assessmentItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">{item.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium leading-tight truncate">{item.label}</p>
                      </div>
                      <p className={`text-[11px] mt-0.5 line-clamp-1 ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Rekapitulasi & Analisis */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Rekap & Hasil Belajar
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleNav('rekap_kelas')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                  activeTab === 'rekap_kelas'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <TableProperties className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-sm">Rekap Kelas (Ledger)</span>
              </button>

              <button
                onClick={() => handleNav('rekap_individu')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                  activeTab === 'rekap_individu'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <UserCheck className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-sm">Rapor Individu Siswa</span>
              </button>

              <button
                onClick={() => handleNav('analisis')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                  activeTab === 'analisis'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <BarChart3 className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-sm">Analisis & Grafik</span>
              </button>

              <button
                onClick={() => handleNav('tindak_lanjut')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                  activeTab === 'tindak_lanjut'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Award className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-sm">Remedial & Pengayaan</span>
              </button>
            </div>
          </div>

          {/* Section: Pengaturan & Database */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Konfigurasi
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleNav('pengaturan')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                  activeTab === 'pengaturan'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-sm">Identitas & Bobot</span>
              </button>

              <button
                onClick={() => handleNav('panduan_db')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                  activeTab === 'panduan_db'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-sm">Panduan & Database</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-400">
          <div className="flex items-center justify-between">
            <span>Mode Offline / Lokal</span>
            <span className="text-emerald-400 font-medium">Tersimpan</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Data aman di peramban ini</p>
        </div>
      </aside>
    </>
  );
};
