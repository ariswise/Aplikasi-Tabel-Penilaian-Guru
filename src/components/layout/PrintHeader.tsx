import React from 'react';
import { SchoolProfile } from '../../types/assessment';

interface PrintHeaderProps {
  profile: SchoolProfile;
  title: string;
  subtitle?: string;
}

export const PrintHeader: React.FC<PrintHeaderProps> = ({ profile, title, subtitle }) => {
  return (
    <div className="print-only mb-6 border-b-2 border-slate-900 pb-4">
      {/* KOP SURAT SEKOLAH */}
      <div className="text-center">
        <h2 className="text-xl font-bold tracking-wide uppercase text-slate-900">
          {profile.namaSekolah || 'SEKOLAH INDONESIA'}
        </h2>
        <p className="text-xs text-slate-700 mt-0.5">
          NPSN: {profile.npsn || '-'} · {profile.alamat || '-'}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-300 text-center">
        <h3 className="text-base font-bold uppercase tracking-wider text-slate-900">
          {title}
        </h3>
        {subtitle && <p className="text-xs text-slate-600 mt-0.5">{subtitle}</p>}
      </div>

      {/* METADATA IDENTITAS KELAS & MAPEL */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-3 text-xs text-slate-800">
        <div className="flex">
          <span className="w-28 font-medium">Mata Pelajaran</span>
          <span>: {profile.mataPelajaran}</span>
        </div>
        <div className="flex">
          <span className="w-28 font-medium">Kelas / Fase</span>
          <span>: {profile.kelas} ({profile.fase})</span>
        </div>
        <div className="flex">
          <span className="w-28 font-medium">Tahun Ajaran</span>
          <span>: {profile.tahunAjaran}</span>
        </div>
        <div className="flex">
          <span className="w-28 font-medium">Semester</span>
          <span>: {profile.semester}</span>
        </div>
        <div className="flex">
          <span className="w-28 font-medium">Guru Pengampu</span>
          <span>: {profile.namaGuru}</span>
        </div>
        <div className="flex">
          <span className="w-28 font-medium">KKTP / KKM</span>
          <span>: {profile.kktp}</span>
        </div>
      </div>
    </div>
  );
};

export const PrintSignatureFooter: React.FC<{ profile: SchoolProfile }> = ({ profile }) => {
  const today = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="print-only mt-10 pt-4 break-inside-avoid">
      <div className="flex justify-between items-start text-xs text-slate-900">
        <div className="text-center w-64">
          <p className="mb-1">Mengetahui,</p>
          <p className="font-semibold">Kepala {profile.namaSekolah}</p>
          <div className="h-16"></div>
          <p className="font-bold underline uppercase">{profile.kepalaSekolah || '................................'}</p>
          <p className="text-[11px] text-slate-700">NIP. {profile.nipKepalaSekolah || '................................'}</p>
        </div>

        <div className="text-center w-64">
          <p className="mb-1">Tempat, {today}</p>
          <p className="font-semibold">Guru Mata Pelajaran</p>
          <div className="h-16"></div>
          <p className="font-bold underline uppercase">{profile.namaGuru || '................................'}</p>
          <p className="text-[11px] text-slate-700">NIP. {profile.nipGuru || '................................'}</p>
        </div>
      </div>
    </div>
  );
};
