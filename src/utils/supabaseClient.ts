import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Pegawai, DailyReport, UserRole } from '../types';

// Default initial teachers for SD Negeri Sukabudi 02
export const INITIAL_PEGAWAI_LIST: Pegawai[] = [
  {
    id: 'peg-admin',
    nip: '19xxxxxxxxxxxxxx',
    namaLengkap: 'Administrator / Kepala Sekolah, M.Pd.',
    email: 'admin@sekolah.sch.id',
    role: 'admin',
    pangkatGolongan: 'Pembina / IV/a',
    jabatan: 'Kepala Sekolah & Admin Utama',
    unitKerja: 'SD Negeri Contoh',
    kotaPenetapan: 'Kota / Kabupaten',
    sertakanAtasan: false,
    namaAtasan: '-',
    nipAtasan: '-',
    jabatanAtasan: '-',
    kopBaris1: 'PEMERINTAH KABUPATEN / KOTA',
    kopBaris2: 'DINAS PENDIDIKAN',
    kopBaris3: 'SD NEGERI CONTOH',
    kopAlamat: 'Jl. Pendidikan No. 01, Wilayah Satuan Pendidikan',
    kopKontak: 'Email: sekolah@disdik.go.id',
    logoType: 'none',
    labelEvidence: 'Evidence Sikawan',
    alamatEvidence: 'Jl. Pendidikan No. 01, Satuan Pendidikan',
    koordinatEvidence: '6.200000°S, 106.816666°E',
    skalaWatermark: 0.55,
    posisiWatermark: 'kiri-bawah',
    sertakanCatatanDiFoto: false,
  },
  {
    id: 'peg-guru-1',
    nip: '19xxxxxxxxxxxxxx',
    namaLengkap: 'Nama Guru / Pegawai, S.Pd.',
    email: 'guru@sekolah.sch.id',
    role: 'guru',
    pangkatGolongan: 'Penata Muda / III/a',
    jabatan: 'Guru Kelas / Mata Pelajaran',
    unitKerja: 'SD Negeri Contoh',
    kotaPenetapan: 'Kota / Kabupaten',
    sertakanAtasan: true,
    namaAtasan: 'Nama Kepala Sekolah, M.Pd.',
    nipAtasan: '19xxxxxxxxxxxxxx',
    jabatanAtasan: 'Kepala Sekolah',
    kopBaris1: 'PEMERINTAH KABUPATEN / KOTA',
    kopBaris2: 'DINAS PENDIDIKAN',
    kopBaris3: 'SD NEGERI CONTOH',
    kopAlamat: 'Jl. Pendidikan No. 01, Wilayah Satuan Pendidikan',
    kopKontak: 'Email: sekolah@disdik.go.id',
    logoType: 'none',
    labelEvidence: 'Evidence Sikawan',
    alamatEvidence: 'Jl. Pendidikan No. 01, Satuan Pendidikan',
    koordinatEvidence: '6.200000°S, 106.816666°E',
    skalaWatermark: 0.55,
    posisiWatermark: 'kiri-bawah',
    sertakanCatatanDiFoto: false,
  },
  {
    id: 'peg-guru-2',
    nip: '19xxxxxxxxxxxxxx',
    namaLengkap: 'Guru Pengajar 2, S.Pd.Gr.',
    email: 'guru2@sekolah.sch.id',
    role: 'guru',
    pangkatGolongan: 'Penata Muda Tk. I / III/b',
    jabatan: 'Guru Kelas / PJOK',
    unitKerja: 'SD Negeri Contoh',
    kotaPenetapan: 'Kota / Kabupaten',
    sertakanAtasan: true,
    namaAtasan: 'Nama Kepala Sekolah, M.Pd.',
    nipAtasan: '19xxxxxxxxxxxxxx',
    jabatanAtasan: 'Kepala Sekolah',
    kopBaris1: 'PEMERINTAH KABUPATEN / KOTA',
    kopBaris2: 'DINAS PENDIDIKAN',
    kopBaris3: 'SD NEGERI CONTOH',
    kopAlamat: 'Jl. Pendidikan No. 01, Wilayah Satuan Pendidikan',
    kopKontak: 'Email: sekolah@disdik.go.id',
    logoType: 'none',
    labelEvidence: 'Evidence Sikawan',
    alamatEvidence: 'Jl. Pendidikan No. 01, Satuan Pendidikan',
    koordinatEvidence: '6.200000°S, 106.816666°E',
    skalaWatermark: 0.55,
    posisiWatermark: 'kiri-bawah',
    sertakanCatatanDiFoto: false,
  },
];

const PEGAWAI_LIST_STORAGE_KEY = 'ejurnal_pegawai_list_v2';
const SUPABASE_CONFIG_KEY = 'ejurnal_supabase_config_v1';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}

export function loadSupabaseConfig(): SupabaseConfig {
  try {
    const raw = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error(e);
  }
  return {
    url: (import.meta as any).env?.VITE_SUPABASE_URL || '',
    anonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '',
    isConnected: false,
  };
}

export function saveSupabaseConfig(cfg: SupabaseConfig): void {
  try {
    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(cfg));
  } catch (e) {
    console.error(e);
  }
}

// Client Singleton
let supabaseClientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const cfg = loadSupabaseConfig();
  if (cfg.url && cfg.anonKey) {
    if (!supabaseClientInstance) {
      try {
        supabaseClientInstance = createClient(cfg.url, cfg.anonKey);
      } catch (e) {
        console.error('Error creating Supabase client:', e);
      }
    }
    return supabaseClientInstance;
  }
  return null;
}

// ==========================================
// PEGAWAI LOCAL & SUPABASE SYNC
// ==========================================
export function loadLocalPegawaiList(): Pegawai[] {
  try {
    const raw = localStorage.getItem(PEGAWAI_LIST_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Reset if it still contains old hardcoded real name 'Tatang Supriatna'
        if (parsed.some((p: Pegawai) => p.namaLengkap && (p.namaLengkap.includes('Tatang') || p.namaLengkap.includes('Siti Rohmah')))) {
          localStorage.setItem(PEGAWAI_LIST_STORAGE_KEY, JSON.stringify(INITIAL_PEGAWAI_LIST));
          return INITIAL_PEGAWAI_LIST;
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error(e);
  }
  // Initialize default
  try {
    localStorage.setItem(PEGAWAI_LIST_STORAGE_KEY, JSON.stringify(INITIAL_PEGAWAI_LIST));
  } catch (e) {
    console.error(e);
  }
  return INITIAL_PEGAWAI_LIST;
}

export function saveLocalPegawaiList(list: Pegawai[]): void {
  try {
    localStorage.setItem(PEGAWAI_LIST_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
}

export async function fetchPegawaiList(): Promise<Pegawai[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('pegawai').select('*');
      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped: Pegawai[] = data.map((d: any) => ({
          id: d.id,
          authUserId: d.auth_user_id,
          nip: d.nip,
          namaLengkap: d.nama_lengkap,
          email: d.email || '',
          role: d.role as UserRole,
          pangkatGolongan: d.pangkat_golongan || '',
          jabatan: d.jabatan || '',
          unitKerja: d.unit_kerja || 'SD Negeri Sukabudi 02',
          kotaPenetapan: d.kota_penetapan || 'Bekasi',
          avatarUrl: d.avatar_url || '/src/assets/images/avatar_teacher_profile_1792826785549.jpg',
          sertakanAtasan: d.sertakan_atasan ?? true,
          namaAtasan: d.nama_atasan || 'Dra. Hj. Siti Rohmah, M.M.Pd.',
          nipAtasan: d.nip_atasan || '19680715 199303 2 004',
          jabatanAtasan: d.jabatan_atasan || 'Kepala Sekolah',
          kopBaris1: d.kop_baris1 || 'DINAS PENDIDIKAN KABUPATEN BEKASI',
          kopBaris2: d.kop_baris2 || 'JURNAL HARIAN KINERJA',
          kopBaris3: d.kop_baris3 || 'SD NEGERI SUKABUDI 02',
          kopAlamat: d.kop_alamat || '',
          kopKontak: d.kop_kontak || '',
          logoType: d.logo_type || 'disdik',
          customLogoUrl: d.custom_logo_url,
          labelEvidence: d.label_evidence || 'Evidence Sikawan',
          alamatEvidence: d.alamat_evidence,
          koordinatEvidence: d.koordinat_evidence,
          skalaWatermark: d.skala_watermark ?? 0.55,
          posisiWatermark: d.posisi_watermark || 'kiri-bawah',
          sertakanCatatanDiFoto: d.sertakan_catatan_di_foto ?? false,
        }));
        saveLocalPegawaiList(mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('Supabase fetchPegawaiList fallback to local:', e);
    }
  }
  return loadLocalPegawaiList();
}

export async function upsertPegawai(pegawai: Pegawai): Promise<Pegawai[]> {
  const current = loadLocalPegawaiList();
  const idx = current.findIndex((p) => p.id === pegawai.id || p.nip === pegawai.nip);
  let updated: Pegawai[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = pegawai;
  } else {
    updated = [...current, pegawai];
  }
  saveLocalPegawaiList(updated);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('pegawai').upsert({
        id: pegawai.id.includes('-') && !pegawai.id.startsWith('peg-') ? pegawai.id : undefined,
        nip: pegawai.nip,
        nama_lengkap: pegawai.namaLengkap,
        email: pegawai.email,
        role: pegawai.role,
        pangkat_golongan: pegawai.pangkatGolongan,
        jabatan: pegawai.jabatan,
        unit_kerja: pegawai.unitKerja,
        kota_penetapan: pegawai.kotaPenetapan,
        sertakan_atasan: pegawai.sertakanAtasan,
        nama_atasan: pegawai.namaAtasan,
        nip_atasan: pegawai.nipAtasan,
        jabatan_atasan: pegawai.jabatanAtasan,
        kop_baris1: pegawai.kopBaris1,
        kop_baris2: pegawai.kopBaris2,
        kop_baris3: pegawai.kopBaris3,
        kop_alamat: pegawai.kopAlamat,
        kop_kontak: pegawai.kopKontak,
        logo_type: pegawai.logoType,
        custom_logo_url: pegawai.customLogoUrl,
        label_evidence: pegawai.labelEvidence,
        alamat_evidence: pegawai.alamatEvidence,
        koordinat_evidence: pegawai.koordinatEvidence,
        skala_watermark: pegawai.skalaWatermark,
        posisi_watermark: pegawai.posisiWatermark,
        sertakan_catatan_di_foto: pegawai.sertakanCatatanDiFoto,
        avatar_url: pegawai.avatarUrl,
      });
    } catch (e) {
      console.warn('Supabase upsertPegawai error:', e);
    }
  }
  return updated;
}

export async function deletePegawai(pegawaiId: string): Promise<Pegawai[]> {
  const current = loadLocalPegawaiList();
  const updated = current.filter((p) => p.id !== pegawaiId);
  saveLocalPegawaiList(updated);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('pegawai').delete().eq('id', pegawaiId);
    } catch (e) {
      console.warn('Supabase deletePegawai error:', e);
    }
  }
  return updated;
}

// Convert a Pegawai item to Profile format
export function convertPegawaiToProfile(pegawai: Pegawai) {
  return {
    avatarUrl: pegawai.avatarUrl || '',
    namaLengkap: pegawai.namaLengkap,
    nip: pegawai.nip,
    pangkatGolongan: pegawai.pangkatGolongan,
    jabatan: pegawai.jabatan,
    unitKerja: pegawai.unitKerja,
    kotaPenetapan: pegawai.kotaPenetapan,
    sertakanAtasan: pegawai.sertakanAtasan,
    namaAtasan: pegawai.namaAtasan,
    nipAtasan: pegawai.nipAtasan,
    jabatanAtasan: pegawai.jabatanAtasan,
    kopBaris1: pegawai.kopBaris1 || 'PEMERINTAH KABUPATEN / KOTA',
    kopBaris2: pegawai.kopBaris2 || 'DINAS PENDIDIKAN',
    kopBaris3: pegawai.kopBaris3 || 'SD NEGERI CONTOH',
    kopAlamat: pegawai.kopAlamat || '',
    kopKontak: pegawai.kopKontak || '',
    logoType: pegawai.logoType || 'none',
    customLogoUrl: pegawai.customLogoUrl,
    loginLogoUrl: pegawai.loginLogoUrl,
    loginLogoType: pegawai.loginLogoType || 'default',
    labelEvidence: pegawai.labelEvidence || 'Evidence Sikawan',
    alamatEvidence: pegawai.alamatEvidence,
    koordinatEvidence: pegawai.koordinatEvidence,
    skalaWatermark: pegawai.skalaWatermark ?? 0.55,
    posisiWatermark: pegawai.posisiWatermark || 'kiri-bawah',
    sertakanCatatanDiFoto: pegawai.sertakanCatatanDiFoto ?? false,
  };
}
