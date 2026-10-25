import React, { useState } from 'react';
import { Pegawai, UserRole } from '../types';
import { getInitials } from '../utils/storage';
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  Search,
  Shield,
  GraduationCap,
  CheckCircle,
  FileText,
  X,
  AlertTriangle,
  Building2,
  UserCheck,
} from 'lucide-react';

interface AdminTeacherManagementViewProps {
  pegawaiList: Pegawai[];
  currentProfile?: any;
  onSavePegawai: (pegawai: Pegawai) => void;
  onDeletePegawai: (id: string) => void;
  onSelectPegawaiForJournal: (pegawai: Pegawai) => void;
  showToast: (msg: string) => void;
}

export const AdminTeacherManagementView: React.FC<AdminTeacherManagementViewProps> = ({
  pegawaiList,
  currentProfile,
  onSavePegawai,
  onDeletePegawai,
  onSelectPegawaiForJournal,
  showToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'guru' | 'admin'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPegawai, setEditingPegawai] = useState<Pegawai | null>(null);
  const [pegawaiToDelete, setPegawaiToDelete] = useState<Pegawai | null>(null);

  // Form State
  const [formNama, setFormNama] = useState('');
  const [formNip, setFormNip] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('guru');
  const [formPangkat, setFormPangkat] = useState('Penata Muda / III/a');
  const [formJabatan, setFormJabatan] = useState('Guru');
  const [formUnitKerja, setFormUnitKerja] = useState(currentProfile?.unitKerja || 'SD Negeri Sukabudi 02');
  const [formNamaAtasan, setFormNamaAtasan] = useState(currentProfile?.namaAtasan || 'Dra. Hj. Siti Rohmah, M.M.Pd.');
  const [formNipAtasan, setFormNipAtasan] = useState(currentProfile?.nipAtasan || '19680715 199303 2 004');
  const [formJabatanAtasan, setFormJabatanAtasan] = useState(currentProfile?.jabatanAtasan || 'Kepala Sekolah');

  const filteredList = pegawaiList.filter((p) => {
    const matchRole = roleFilter === 'all' || p.role === roleFilter;
    const q = searchTerm.toLowerCase().trim();
    if (!q) return matchRole;
    return (
      matchRole &&
      (p.namaLengkap.toLowerCase().includes(q) ||
        p.nip.includes(q) ||
        p.jabatan.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q))
    );
  });

  const handleOpenAddModal = () => {
    setEditingPegawai(null);
    setFormNama('');
    setFormNip('');
    setFormEmail('');
    setFormRole('guru');
    setFormPangkat('Penata Muda / III/a');
    setFormJabatan('Guru');
    setFormUnitKerja(currentProfile?.unitKerja || 'SD Negeri Sukabudi 02');
    setFormNamaAtasan(currentProfile?.namaAtasan || 'Dra. Hj. Siti Rohmah, M.M.Pd.');
    setFormNipAtasan(currentProfile?.nipAtasan || '19680715 199303 2 004');
    setFormJabatanAtasan(currentProfile?.jabatanAtasan || 'Kepala Sekolah');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Pegawai) => {
    setEditingPegawai(p);
    setFormNama(p.namaLengkap);
    setFormNip(p.nip);
    setFormEmail(p.email || '');
    setFormRole(p.role);
    setFormPangkat(p.pangkatGolongan);
    setFormJabatan(p.jabatan);
    setFormUnitKerja(p.unitKerja || currentProfile?.unitKerja || 'SD Negeri Sukabudi 02');
    setFormNamaAtasan(p.namaAtasan || currentProfile?.namaAtasan || 'Dra. Hj. Siti Rohmah, M.M.Pd.');
    setFormNipAtasan(p.nipAtasan || currentProfile?.nipAtasan || '19680715 199303 2 004');
    setFormJabatanAtasan(p.jabatanAtasan || currentProfile?.jabatanAtasan || 'Kepala Sekolah');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama || !formNip) {
      alert('Nama lengkap dan NIP wajib diisi.');
      return;
    }

    const newPegawai: Pegawai = {
      id: editingPegawai ? editingPegawai.id : 'peg-' + Date.now(),
      namaLengkap: formNama,
      nip: formNip,
      email: formEmail,
      role: formRole,
      pangkatGolongan: formPangkat,
      jabatan: formJabatan,
      unitKerja: formUnitKerja || currentProfile?.unitKerja || 'SD Negeri Sukabudi 02',
      kotaPenetapan: currentProfile?.kotaPenetapan || 'Bekasi',
      sertakanAtasan: formRole === 'guru',
      namaAtasan: formNamaAtasan,
      nipAtasan: formNipAtasan,
      jabatanAtasan: formJabatanAtasan,
      kopBaris1: currentProfile?.kopBaris1 || 'DINAS PENDIDIKAN KABUPATEN BEKASI',
      kopBaris2: currentProfile?.kopBaris2 || 'JURNAL HARIAN KINERJA',
      kopBaris3: formUnitKerja || currentProfile?.kopBaris3 || 'SD NEGERI SUKABUDI 02',
      kopAlamat: currentProfile?.kopAlamat || 'Kp Jl. Bulak Temu, Sukabudi, Kec. Sukawangi, Kab. Bekasi 17620',
      kopKontak: currentProfile?.kopKontak || 'Email: sdn.sukabudi02@disdik.bekasikab.go.id',
      logoType: currentProfile?.logoType || 'disdik',
      customLogoUrl: currentProfile?.customLogoUrl,
      loginLogoType: currentProfile?.loginLogoType || 'default',
      loginLogoUrl: currentProfile?.loginLogoUrl,
      avatarUrl: editingPegawai?.avatarUrl || '',
      labelEvidence: currentProfile?.labelEvidence || 'Evidence Sikawan',
      alamatEvidence: currentProfile?.alamatEvidence || 'Kp Jl. Bulak Temu, Sukabudi, Kec. Sukawangi, Kabupaten Bekasi, Jawa Barat 17620',
      koordinatEvidence: currentProfile?.koordinatEvidence || '6.139568°S, 107.110048°E',
      skalaWatermark: currentProfile?.skalaWatermark ?? 0.55,
      posisiWatermark: currentProfile?.posisiWatermark || 'kiri-bawah',
      sertakanCatatanDiFoto: currentProfile?.sertakanCatatanDiFoto ?? false,
    };

    onSavePegawai(newPegawai);
    setIsModalOpen(false);
    showToast(`Data pegawai ${newPegawai.namaLengkap} berhasil disimpan`);
  };

  const handleConfirmDelete = () => {
    if (!pegawaiToDelete) return;
    if (pegawaiToDelete.role === 'admin' && pegawaiList.filter((p) => p.role === 'admin').length <= 1) {
      alert('Tidak dapat menghapus satu-satunya akun Admin.');
      setPegawaiToDelete(null);
      return;
    }
    onDeletePegawai(pegawaiToDelete.id);
    showToast(`Pegawai ${pegawaiToDelete.namaLengkap} berhasil dihapus`);
    setPegawaiToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Panel Admin
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Kelola Data Guru & Pegawai Sekolah
            </h2>
            <p className="text-xs text-slate-500">
              Manajemen identitas profil guru, NIP, jabatan, atasan, dan hak akses sistem (Role Guru / Admin).
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs md:text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Tambah Guru Baru</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-semibold text-slate-500 uppercase">Total Pegawai</span>
            <div className="text-xl font-black text-slate-900 mt-1">{pegawaiList.length} Orang</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-semibold text-slate-500 uppercase">Role Guru</span>
            <div className="text-xl font-black text-blue-600 mt-1">
              {pegawaiList.filter((p) => p.role === 'guru').length} Guru
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-semibold text-slate-500 uppercase">Role Admin</span>
            <div className="text-xl font-black text-purple-600 mt-1">
              {pegawaiList.filter((p) => p.role === 'admin').length} Akun
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-semibold text-slate-500 uppercase">Unit Sekolah</span>
            <div className="text-xs font-bold text-slate-800 mt-2 truncate">
              SD Negeri Sukabudi 02
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama, NIP, atau jabatan guru..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs md:text-sm text-slate-800 focus:outline-blue-600 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <label className="text-xs font-semibold text-slate-500">Filter Role:</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-blue-600 cursor-pointer shadow-2xs"
          >
            <option value="all">Semua Role</option>
            <option value="guru">Hanya Guru</option>
            <option value="admin">Hanya Admin</option>
          </select>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-900 border-b border-slate-300">
                <th className="border border-slate-300 px-3 py-3 text-center font-bold w-12">No</th>
                <th className="border border-slate-300 px-4 py-3 text-left font-bold">Nama & NIP Pegawai</th>
                <th className="border border-slate-300 px-3 py-3 text-center font-bold w-24">Role</th>
                <th className="border border-slate-300 px-4 py-3 text-left font-bold">Jabatan & Golongan</th>
                <th className="border border-slate-300 px-3 py-3 text-left font-bold">Atasan Langsung</th>
                <th className="border border-slate-300 px-3 py-3 text-center font-bold w-48">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredList.map((p, idx) => (
                <tr key={p.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="border border-slate-300 px-2 py-3 text-center font-bold text-slate-700">
                    {idx + 1}
                  </td>
                  <td className="border border-slate-300 px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden ${
                          p.avatarUrl
                            ? 'bg-slate-100'
                            : p.role === 'admin'
                            ? 'bg-purple-600 text-white'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {p.avatarUrl ? (
                          <img
                            src={p.avatarUrl}
                            alt={p.namaLengkap}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{getInitials(p.namaLengkap)}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">
                          {p.namaLengkap}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          NIP. {p.nip}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="border border-slate-300 px-3 py-3 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        p.role === 'admin'
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : 'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {p.role}
                    </span>
                  </td>
                  <td className="border border-slate-300 px-4 py-3">
                    <div className="font-semibold text-slate-800">{p.jabatan}</div>
                    <div className="text-[11px] text-slate-500">{p.pangkatGolongan}</div>
                  </td>
                  <td className="border border-slate-300 px-3 py-3">
                    <div className="text-slate-800 font-medium text-xs">{p.namaAtasan || '-'}</div>
                    <div className="text-[10px] text-slate-500">{p.jabatanAtasan}</div>
                  </td>
                  <td className="border border-slate-300 px-3 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onSelectPegawaiForJournal(p)}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                        title="Isi jurnal atas nama guru ini"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Isi Jurnal</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(p)}
                        className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                        title="Edit data guru"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPegawaiToDelete(p)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg transition-colors cursor-pointer"
                        title="Hapus data guru"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah / Edit Pegawai */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {editingPegawai ? 'Edit Data Pegawai' : 'Tambah Guru / Pegawai Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">Konfigurasi akun dan data kedinasan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap (dengan Gelar) *
                </label>
                <input
                  type="text"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  placeholder="Contoh: Tatang Supriatna, S.Pd."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-blue-600"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIP Pegawai *
                  </label>
                  <input
                    type="text"
                    value={formNip}
                    onChange={(e) => setFormNip(e.target.value)}
                    placeholder="Contoh: 1989061420201210004"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Role Hak Akses (RBAC) *
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-blue-600 cursor-pointer"
                  >
                    <option value="guru">Guru (Hanya Akun Sendiri)</option>
                    <option value="admin">Admin (Akses Semua Guru)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jabatan Guru / Tugas
                  </label>
                  <input
                    type="text"
                    value={formJabatan}
                    onChange={(e) => setFormJabatan(e.target.value)}
                    placeholder="Contoh: Guru Kelas VI"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pangkat / Golongan
                  </label>
                  <input
                    type="text"
                    value={formPangkat}
                    onChange={(e) => setFormPangkat(e.target.value)}
                    placeholder="Contoh: Penata Muda / III/a"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Akun (Opsional)
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="Contoh: tatang.supriatna@guru.sd.belajar.id"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 block">
                  Atasan Langsung (Kepala Sekolah):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formNamaAtasan}
                    onChange={(e) => setFormNamaAtasan(e.target.value)}
                    placeholder="Nama Atasan"
                    className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    value={formNipAtasan}
                    onChange={(e) => setFormNipAtasan(e.target.value)}
                    placeholder="NIP Atasan"
                    className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Simpan Data Pegawai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Pegawai */}
      {pegawaiToDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Hapus Data Pegawai?</h4>
                <p className="text-[11px] text-slate-500">{pegawaiToDelete.namaLengkap}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Apakah Anda yakin ingin menghapus profil pegawai ini dari sistem sekolah?
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPegawaiToDelete(null)}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
