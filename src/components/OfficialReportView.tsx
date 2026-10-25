import React from 'react';
import { Profile, DailyReport } from '../types';
import { formatTanggalLengkapIndo } from '../utils/dateUtils';

interface OfficialReportViewProps {
  profile: Profile;
  report: DailyReport;
  printableRef?: React.RefObject<HTMLDivElement | null>;
}

export const OfficialReportView: React.FC<OfficialReportViewProps> = ({
  profile,
  report,
  printableRef,
}) => {
  const tanggalLengkap = formatTanggalLengkapIndo(report.tanggal);

  const renderLogo = () => {
    if (profile.customLogoUrl) {
      return (
        <img
          src={profile.customLogoUrl}
          alt="Logo Instansi"
          crossOrigin="anonymous"
          className="w-16 h-16 object-contain shrink-0"
        />
      );
    }
    return null;
  };

  const isF4 = report.paperSize === 'F4';

  // Format Keterangan to 2 lines like in reference PDF: "Selesai 100%\n(Sesuai Target)"
  const formatKeterangan = (text: string) => {
    if (!text) {
      return (
        <div className="leading-tight">
          <div className="font-semibold text-black">Selesai 100%</div>
          <div className="text-[10px] text-slate-700 mt-0.5">(Sesuai Target)</div>
        </div>
      );
    }

    if (text.includes('(')) {
      const parts = text.split('(');
      const main = parts[0].trim();
      const sub = '(' + parts.slice(1).join('(').trim();
      return (
        <div className="leading-tight">
          <div className="font-semibold text-black">{main}</div>
          <div className="text-[10px] text-slate-700 mt-0.5">{sub}</div>
        </div>
      );
    }

    return (
      <div className="leading-tight">
        <div className="font-semibold text-black">{text}</div>
        <div className="text-[10px] text-slate-700 mt-0.5">(Sesuai Target)</div>
      </div>
    );
  };

  // Format Waktu to show time + WIB below
  const formatWaktu = (waktu: string) => {
    if (!waktu) return '-';
    const clean = waktu.replace(/WIB/i, '').trim();
    return (
      <div className="leading-tight">
        <div className="font-medium text-black">{clean}</div>
        <div className="text-[11px] text-slate-800 font-normal mt-0.5">WIB</div>
      </div>
    );
  };

  return (
    <div className="w-full flex justify-center py-4 bg-slate-200/70 overflow-x-auto print-clean-wrapper print:bg-white print:p-0 print:m-0">
      <div
        id="printable-document"
        ref={printableRef}
        style={{
          width: isF4 ? '215mm' : '210mm',
          minHeight: isF4 ? '330mm' : '297mm',
          boxSizing: 'border-box',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
          fontFamily:
            report.fontFamily === 'merriweather'
              ? 'Merriweather, serif'
              : report.fontFamily === 'times'
              ? '"Times New Roman", Times, serif'
              : 'Arial, "Helvetica Neue", Helvetica, sans-serif',
        }}
        className={`bg-white text-black shadow-xl print:shadow-none px-8 py-8 print:p-0 leading-normal flex flex-col justify-between transition-all duration-200 ${
          report.fontFamily === 'arial'
            ? 'font-arial'
            : report.fontFamily === 'merriweather'
            ? 'font-serif'
            : report.fontFamily === 'times'
            ? 'font-dinas'
            : 'font-sans'
        }`}
      >
        <div>
          {/* KOP SURAT RESMI */}
          <div className="official-kop-header relative pb-2">
            <div className="flex items-center justify-between gap-3">
              {/* Left Logo if uploaded */}
              {profile.customLogoUrl ? (
                <div className="w-20 shrink-0 flex items-center justify-start">
                  <img
                    src={profile.customLogoUrl}
                    alt="Logo Instansi"
                    crossOrigin="anonymous"
                    className="w-16 h-16 object-contain shrink-0"
                  />
                </div>
              ) : null}

              {/* Center Text */}
              <div className="flex-1 text-center">
                <h3 className="text-sm md:text-[15px] font-bold tracking-wide uppercase text-black leading-tight">
                  {profile.kopBaris1 || 'DINAS PENDIDIKAN KABUPATEN BEKASI'}
                </h3>
                <h1 className="text-base md:text-lg font-black tracking-wider uppercase text-black leading-tight mt-0.5">
                  {profile.kopBaris2 || 'JURNAL HARIAN KINERJA'}
                </h1>
                <h2 className="text-xs md:text-sm font-semibold tracking-wide uppercase text-black leading-tight mt-0.5">
                  {profile.kopBaris3 || 'SD NEGERI SUKABUDI 02'}
                </h2>
                {profile.kopAlamat && (
                  <p className="text-[11px] text-slate-700 leading-tight mt-1">
                    {profile.kopAlamat}
                  </p>
                )}
                {profile.kopKontak && (
                  <p className="text-[10px] text-slate-700 leading-tight">
                    {profile.kopKontak}
                  </p>
                )}
              </div>

              {/* Right Spacer for exact symmetrical centering only when logo exists */}
              {profile.customLogoUrl ? (
                <div className="w-20 shrink-0 hidden sm:flex items-center justify-end opacity-0 select-none pointer-events-none">
                  <div className="w-16 h-16"></div>
                </div>
              ) : null}
            </div>

            {/* Garis Pembatas Kop Surat (Garis Solid Hitam Tebal sesuai PDF) */}
            <div className="mt-2.5 border-b-2 border-black w-full"></div>
          </div>

          {/* TABEL IDENTITAS PEGAWAI */}
          <div className="my-3 text-xs md:text-[13px] leading-relaxed">
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="w-32 py-0.5 font-bold text-black whitespace-nowrap">Nama</td>
                  <td className="w-4 py-0.5 text-center text-black font-normal">:</td>
                  <td className="py-0.5 text-black font-normal">
                    {profile.namaLengkap || 'Tatang Supriatna, S.Pd.'}
                  </td>
                </tr>
                <tr>
                  <td className="py-0.5 font-bold text-black whitespace-nowrap">NIP</td>
                  <td className="py-0.5 text-center text-black font-normal">:</td>
                  <td className="py-0.5 text-black font-normal">
                    {profile.nip || '1989061420201210004'}
                  </td>
                </tr>
                <tr>
                  <td className="py-0.5 font-bold text-black whitespace-nowrap">Jabatan</td>
                  <td className="py-0.5 text-center text-black font-normal">:</td>
                  <td className="py-0.5 text-black font-normal">
                    {profile.jabatan || 'Guru'}
                  </td>
                </tr>
                <tr>
                  <td className="py-0.5 font-bold text-black whitespace-nowrap">Unit Kerja</td>
                  <td className="py-0.5 text-center text-black font-normal">:</td>
                  <td className="py-0.5 text-black font-normal">
                    {profile.unitKerja || 'SD Negeri Sukabudi 02'}
                  </td>
                </tr>
                <tr>
                  <td className="py-0.5 font-bold text-black whitespace-nowrap">Hari / Tanggal</td>
                  <td className="py-0.5 text-center text-black font-normal">:</td>
                  <td className="py-0.5 text-black font-normal">{tanggalLengkap}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* TABEL UTAMA JURNAL KINERJA (5 KOLOM BER-HEADER NAVY GELAP) */}
          <div className="mt-3 mb-6">
            <table
              className="w-full border-collapse border border-black text-xs"
              style={{
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            >
              <thead>
                <tr
                  className="bg-[#1a2638] text-white print:bg-[#1a2638] print:text-white text-center font-bold"
                  style={{
                    backgroundColor: '#1a2638',
                    color: '#ffffff',
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact',
                  }}
                >
                  <th
                    className="border border-black px-1.5 py-3 text-center font-bold text-white leading-tight"
                    style={{ width: '6.5%', backgroundColor: '#1a2638', color: '#ffffff' }}
                  >
                    <div>Nom</div>
                    <div>or</div>
                  </th>
                  <th
                    className="border border-black px-2 py-3 text-center font-bold text-white"
                    style={{ width: '15%', backgroundColor: '#1a2638', color: '#ffffff' }}
                  >
                    Waktu
                  </th>
                  <th
                    className="border border-black px-3 py-3 text-center font-bold text-white"
                    style={{ width: '38%', backgroundColor: '#1a2638', color: '#ffffff' }}
                  >
                    Kegiatan
                  </th>
                  <th
                    className="border border-black px-2 py-3 text-center font-bold text-white leading-tight"
                    style={{ width: '25.5%', backgroundColor: '#1a2638', color: '#ffffff' }}
                  >
                    <div>Bukti Dukung</div>
                    <div className="font-medium text-[11px]">(Time Mark / Geotag)</div>
                  </th>
                  <th
                    className="border border-black px-2 py-3 text-center font-bold text-white"
                    style={{ width: '15%', backgroundColor: '#1a2638', color: '#ffffff' }}
                  >
                    Keterangan
                  </th>
                </tr>
              </thead>
              <tbody>
                {report.kegiatanList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="border border-black p-4 text-center text-slate-500 italic"
                    >
                      Belum ada kegiatan yang ditambahkan untuk hari ini.
                    </td>
                  </tr>
                ) : (
                  report.kegiatanList.map((item, index) => (
                    <tr key={item.id} className="page-break-inside-avoid">
                      {/* Kolom 1: Nomor */}
                      <td className="border border-black p-2 text-center font-bold text-black align-middle">
                        {index + 1}
                      </td>

                      {/* Kolom 2: Waktu */}
                      <td className="border border-black p-2 text-center align-middle">
                        {formatWaktu(item.waktu)}
                      </td>

                      {/* Kolom 3: Uraian Kegiatan */}
                      <td className="border border-black p-3 text-left align-middle text-black leading-relaxed">
                        <p className="whitespace-pre-line text-xs leading-normal">
                          {item.deskripsi}
                        </p>
                      </td>

                      {/* Kolom 4: Bukti Dukung (Foto ber-stempel / Time Mark) */}
                      <td className="border border-black p-2 text-center align-middle">
                        {item.buktiFotoUrl ? (
                          <div className="flex flex-col items-center justify-center">
                            <div className="relative rounded-xs overflow-hidden border border-slate-300 max-w-[170px] shadow-2xs">
                              <img
                                src={item.buktiFotoUrl}
                                alt={`Bukti kegiatan ${index + 1}`}
                                crossOrigin="anonymous"
                                className="max-h-24 w-auto object-cover mx-auto"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="h-16 flex flex-col items-center justify-center border border-dashed border-slate-300 rounded bg-slate-50 text-[10px] text-slate-400 p-1">
                            <span>Bukti Foto</span>
                            <span className="text-[9px] italic">(Terlampir)</span>
                          </div>
                        )}
                      </td>

                      {/* Kolom 5: Keterangan */}
                      <td className="border border-black p-2 text-center align-middle">
                        {formatKeterangan(item.keterangan)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* LEMBAR PENGESAHAN / TANDA TANGAN */}
          <div className="mt-8 page-break-inside-avoid text-xs md:text-sm">
            {profile.sertakanAtasan ? (
              /* DUAL SIGNATURE MODE (IF ATASAN TOGGLED) */
              <div className="flex justify-between items-start gap-4">
                <div className="w-64 text-center">
                  <p className="text-black font-medium">Mengetahui,</p>
                  <p className="text-black font-medium">
                    {profile.jabatanAtasan || 'Kepala Sekolah'}
                  </p>

                  <div className="h-20 flex items-center justify-center my-1">
                    {profile.tandaTanganAtasanUrl ? (
                      <img
                        src={profile.tandaTanganAtasanUrl}
                        alt="Tanda Tangan Atasan"
                        crossOrigin="anonymous"
                        className="max-h-16 max-w-full object-contain"
                      />
                    ) : (
                      <div className="h-16 w-32 border-b border-dotted border-slate-300"></div>
                    )}
                  </div>

                  <p className="font-bold text-black uppercase">
                    {profile.namaAtasan || '( Nama Kepala Sekolah )'}
                  </p>
                  <p className="text-[11px] text-black">
                    NIP. {profile.nipAtasan || '....................................'}
                  </p>
                </div>

                <div className="w-64 text-center">
                  <p className="text-black">{tanggalLengkap}</p>
                  <p className="font-medium text-black">Pegawai Yang Bersangkutan,</p>

                  <div className="h-20 flex items-center justify-center my-1">
                    {profile.tandaTanganPegawaiUrl ? (
                      <img
                        src={profile.tandaTanganPegawaiUrl}
                        alt="Tanda Tangan Pegawai"
                        crossOrigin="anonymous"
                        className="max-h-16 max-w-full object-contain"
                      />
                    ) : (
                      <div className="h-16 w-32 border-b border-dotted border-slate-300"></div>
                    )}
                  </div>

                  <p className="font-bold text-black">
                    {profile.namaLengkap || 'Tatang Supriatna, S.Pd.'}
                  </p>
                  <p className="text-[11px] text-black">
                    NIP. {profile.nip || '1989061420201210004'}
                  </p>
                </div>
              </div>
            ) : (
              /* SINGLE SIGNATURE MODE (PERSIS SESUAI LAMPIRAN PDF) */
              <div className="flex justify-end">
                <div className="w-64 text-center">
                  <p className="text-black font-normal">{tanggalLengkap}</p>
                  <p className="font-semibold text-black mt-0.5">Pegawai Yang Bersangkutan,</p>

                  {/* Signature Space */}
                  <div className="h-20 flex items-center justify-center my-1">
                    {profile.tandaTanganPegawaiUrl ? (
                      <img
                        src={profile.tandaTanganPegawaiUrl}
                        alt="Tanda Tangan Pegawai"
                        crossOrigin="anonymous"
                        className="max-h-16 max-w-full object-contain"
                      />
                    ) : (
                      <div className="h-16"></div>
                    )}
                  </div>

                  <p className="font-bold text-black text-xs md:text-sm">
                    {profile.namaLengkap || 'Tatang Supriatna, S.Pd.'}
                  </p>
                  <p className="text-[11px] text-black mt-0.5 font-normal">
                    NIP. {profile.nip || '1989061420201210004'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER HALAMAN PERSIS DENGAN LAMPIRAN PDF */}
        <footer className="official-report-footer mt-8 pt-4 text-center text-[10px] text-slate-500 select-none">
          Jurnal Harian Kinerja • {profile.namaLengkap || 'Tatang Supriatna, S.Pd.'} ({tanggalLengkap}) • Halaman 1 dari 1
        </footer>
      </div>
    </div>
  );
};
