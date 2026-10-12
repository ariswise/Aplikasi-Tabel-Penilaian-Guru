import { AssessmentWeight, PredicateGrade, SchoolProfile } from '../types/assessment';

export function getPredicate(
  score: number | null,
  ranges: SchoolProfile['rentangPredikat']
): { predikat: PredicateGrade | '-'; label: string; color: string } {
  if (score === null || score === undefined || isNaN(score)) {
    return { predikat: '-', label: 'Belum Dinilai', color: 'text-slate-400 bg-slate-100' };
  }

  if (score >= ranges.A.min && score <= ranges.A.max) {
    return { predikat: 'A', label: ranges.A.label, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  }
  if (score >= ranges.B.min && score <= ranges.B.max) {
    return { predikat: 'B', label: ranges.B.label, color: 'text-blue-700 bg-blue-50 border-blue-200' };
  }
  if (score >= ranges.C.min && score <= ranges.C.max) {
    return { predikat: 'C', label: ranges.C.label, color: 'text-amber-700 bg-amber-50 border-amber-200' };
  }
  return { predikat: 'D', label: ranges.D.label, color: 'text-rose-700 bg-rose-50 border-rose-200' };
}

export function getStatusKetercapaian(
  score: number | null,
  kktp: number
): { status: 'Tercapai' | 'Perlu Remedial' | 'Belum Dinilai'; color: string; bg: string } {
  if (score === null || score === undefined || isNaN(score)) {
    return { status: 'Belum Dinilai', color: 'text-slate-500', bg: 'bg-slate-100' };
  }
  if (score >= kktp) {
    return { status: 'Tercapai', color: 'text-emerald-700', bg: 'bg-emerald-50' };
  }
  return { status: 'Perlu Remedial', color: 'text-rose-700', bg: 'bg-rose-50' };
}

export function calculateAverage(scores: (number | null)[]): number | null {
  const validScores = scores.filter((s): s is number => s !== null && s !== undefined && !isNaN(s));
  if (validScores.length === 0) return null;
  const sum = validScores.reduce((acc, curr) => acc + curr, 0);
  return Number((sum / validScores.length).toFixed(1));
}

export function calculateHighest(scores: (number | null)[]): number | null {
  const validScores = scores.filter((s): s is number => s !== null && s !== undefined && !isNaN(s));
  if (validScores.length === 0) return null;
  return Math.max(...validScores);
}

export function calculateLowest(scores: (number | null)[]): number | null {
  const validScores = scores.filter((s): s is number => s !== null && s !== undefined && !isNaN(s));
  if (validScores.length === 0) return null;
  return Math.min(...validScores);
}

/**
 * Menghitung Nilai Akhir (NA) berdasarkan bobot kurikulum:
 * Diagnostik TIDAK dimasukkan ke NA Rapor.
 * NA = (BobotFormatif * RataFormatif + BobotSumatifMateri * RataSumatifMateri + BobotSTS * STS + BobotSAS * SAS) / 100
 */
export function calculateFinalScore(
  rataFormatif: number | null,
  rataSumatifMateri: number | null,
  sts: number | null,
  sas: number | null,
  bobot: AssessmentWeight
): number | null {
  const parts: { val: number; weight: number }[] = [];

  if (rataFormatif !== null && bobot.formatif > 0) {
    parts.push({ val: rataFormatif, weight: bobot.formatif });
  }
  if (rataSumatifMateri !== null && bobot.sumatifMateri > 0) {
    parts.push({ val: rataSumatifMateri, weight: bobot.sumatifMateri });
  }
  if (sts !== null && bobot.sts > 0) {
    parts.push({ val: sts, weight: bobot.sts });
  }
  if (sas !== null && bobot.sas > 0) {
    parts.push({ val: sas, weight: bobot.sas });
  }

  if (parts.length === 0) return null;

  const totalUsedWeight = parts.reduce((acc, p) => acc + p.weight, 0);
  if (totalUsedWeight === 0) return null;

  const weightedSum = parts.reduce((acc, p) => acc + (p.val * p.weight), 0);
  return Number((weightedSum / totalUsedWeight).toFixed(1));
}
