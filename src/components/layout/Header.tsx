import React from 'react';
import { SchoolProfile } from '../../types/assessment';
import {
  Menu,
  GraduationCap,
  Download,
  BookOpen,
  Calendar,
  Layers,
  Database,
  Printer,
} from 'lucide-react';
import { printCurrentView } from '../../utils/exportUtils';

interface HeaderProps {
  profile: SchoolProfile;
  activeTabTitle: string;
  onToggleSidebar: () => void;
  onOpenDatabaseGuide: () => void;
  onQuickBackup: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  activeTabTitle,
  onToggleSidebar,
  onOpenDatabaseGuide,
  onQuickBackup,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 no-print">
      <div className="px-4 lg:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & App Name */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-none uppercase">
                  Aplikasi Tabel Penilaian Guru
                </h1>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                  Kurikulum Merdeka & Umum
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5 truncate max-w-xs md:max-w-md">
                {profile.namaSekolah} · {profile.mataPelajaran} ({profile.kelas})
              </p>
            </div>
          </div>
        </div>

        {/* Right: Quick School Info Badges & Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Quick Context Tags (Desktop) */}
          <div className="hidden xl:flex items-center gap-3 text-xs text-slate-600 border-r border-slate-200 pr-3 mr-1">
            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              <span>{profile.mataPelajaran}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              <span>{profile.kelas} - {profile.fase}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              <span>TP {profile.tahunAjaran} (Sem. {profile.semester.split(' ')[0]})</span>
            </div>
          </div>

          {/* Quick Print Button */}
          <button
            onClick={() => printCurrentView(`${activeTabTitle} - ${profile.namaSekolah}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="Cetak Tampilan Saat Ini (Kop Surat & Format Rapi)"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Cetak</span>
          </button>

          {/* Quick Backup JSON */}
          <button
            onClick={onQuickBackup}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="Cadangkan Data ke File JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden md:inline">Cadangkan</span>
          </button>

          {/* Storage & Cloud Status Indicator */}
          <button
            onClick={onOpenDatabaseGuide}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
            title="Status Penyimpanan Lokal & Panduan Database"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Lokal Aktif</span>
          </button>
        </div>
      </div>
    </header>
  );
};
