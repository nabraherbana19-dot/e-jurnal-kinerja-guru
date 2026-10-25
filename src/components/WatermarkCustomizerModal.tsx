import React, { useState } from 'react';
import { ActivityItem, Profile } from '../types';
import { applyWatermarkToImage } from '../utils/watermark';
import { formatTanggalSikawan, extractTimeHHMM } from '../utils/dateUtils';
import {
  X,
  Clock,
  Calendar,
  MapPin,
  Navigation,
  Sparkles,
  Check,
  Loader2,
  Maximize2,
  Move,
} from 'lucide-react';

interface WatermarkCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ActivityItem;
  profile: Profile;
  reportDate: string;
  onSaveUpdatedItem: (updated: Partial<ActivityItem>) => void;
}

export const WatermarkCustomizerModal: React.FC<WatermarkCustomizerModalProps> = ({
  isOpen,
  onClose,
  item,
  profile,
  reportDate,
  onSaveUpdatedItem,
}) => {
  const [label, setLabel] = useState(profile.labelEvidence || 'Evidence Sikawan');
  const [time, setTime] = useState(item.customTimeHHMM || extractTimeHHMM(item.waktu));
  const [dateStr, setDateStr] = useState(
    item.customDateText || formatTanggalSikawan(reportDate)
  );
  const [address, setAddress] = useState(
    profile.alamatEvidence ||
      'Kp Jl. Bulak Temu, Sukabudi, Kec. Sukawangi, Kabupaten Bekasi, Jawa Barat 17620'
  );
  const [coords, setCoords] = useState(
    profile.koordinatEvidence || '6.139568°S, 107.110048°E'
  );
  const [skala, setSkala] = useState<number>(
    item.customSkala ?? profile.skalaWatermark ?? 0.58
  );
  const [posisi, setPosisi] = useState<'kiri-bawah' | 'kiri-tengah' | 'kiri-atas'>(
    item.customPosisi ?? profile.posisiWatermark ?? 'kiri-bawah'
  );
  const [sertakanCatatan, setSertakanCatatan] = useState<boolean>(
    profile.sertakanCatatanDiFoto ?? false
  );

  const [isApplying, setIsApplying] = useState(false);
  const [isGettingGps, setIsGettingGps] = useState(false);

  if (!isOpen) return null;

  const handleGetCurrentGps = () => {
    if (!navigator.geolocation) {
      alert('Geolokasi tidak didukung oleh browser Anda.');
      return;
    }
    setIsGettingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const latDir = lat >= 0 ? 'N' : 'S';
        const lngDir = lng >= 0 ? 'E' : 'W';
        const formatted = `${Math.abs(lat).toFixed(6)}°${latDir}, ${Math.abs(lng).toFixed(6)}°${lngDir}`;
        setCoords(formatted);
        setIsGettingGps(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        alert('Tidak dapat mendeteksi GPS. Menggunakan koordinat default.');
        setIsGettingGps(false);
      },
      { timeout: 7000 }
    );
  };

  const handleApply = async () => {
    const rawImageSource = item.originalFotoUrl || item.buktiFotoUrl;
    if (!rawImageSource) {
      onClose();
      return;
    }

    try {
      setIsApplying(true);

      const res = await fetch(rawImageSource);
      const blob = await res.blob();

      const result = await applyWatermarkToImage(blob, {
        labelEvidence: label,
        timeHHMM: time,
        dateText: dateStr,
        addressText: address,
        coordinates: coords,
        catatanText: item.deskripsi,
        sertakanCatatan,
        skala,
        posisi,
      });

      onSaveUpdatedItem({
        buktiFotoUrl: result.dataUrl,
        watermarkDetail: result.stampText,
        customTimeHHMM: time,
        customDateText: dateStr,
        customSkala: skala,
        customPosisi: posisi,
      });

      onClose();
    } catch (err) {
      console.error(err);
      alert('Gagal memperbarui stempel foto.');
    } finally {
      setIsApplying(false);
    }
  };

  const handleSetSampleSikawan = () => {
    setLabel('Evidence Sikawan');
    setTime('11:22');
    setDateStr('Rabu, 20/08/2025');
    setAddress('Kp Jl. Bulak Temu, Sukabudi, Kec. Sukawangi, Kabupaten Bekasi, Jawa Barat 17620');
    setCoords('6.139568°S, 107.110048°E');
    setSkala(0.58); // Compact 28%
    setPosisi('kiri-bawah');
    setSertakanCatatan(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 px-5 py-4 text-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-black/10 rounded-lg">
              <Sparkles className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                Kustomisasi Stempel Evidence Sikawan
              </h3>
              <p className="text-xs text-slate-900/80 font-medium">
                Sesuaikan ukuran proporsional, posisi, dan teks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-black/10 text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="px-5 py-2.5 bg-amber-50/70 border-b border-amber-200/80 flex items-center justify-between text-xs">
          <span className="font-semibold text-amber-900">Preset Cepat:</span>
          <button
            type="button"
            onClick={handleSetSampleSikawan}
            className="px-2.5 py-1 bg-amber-200/80 hover:bg-amber-300 text-amber-950 rounded-lg font-bold transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Reset Proporsi Asli (Kecil Ramping)
          </button>
        </div>

        {/* Form Inputs */}
        <div className="p-5 space-y-4 text-xs md:text-sm max-h-[62vh] overflow-y-auto">
          {/* PENGATURAN UKURAN / SKALA PROPORSI */}
          <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <Maximize2 className="w-4 h-4 text-amber-700" />
                Ukuran Stempel pada Foto
              </label>
              <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                {Math.round(skala * 48.6)}% Lebar Foto
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSkala(0.45)}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                  skala <= 0.48
                    ? 'border-amber-600 bg-amber-500 text-slate-950 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-amber-50'
                }`}
              >
                Sangat Kecil (22%)
              </button>
              <button
                type="button"
                onClick={() => setSkala(0.58)}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                  skala > 0.48 && skala <= 0.65
                    ? 'border-amber-600 bg-amber-500 text-slate-950 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-amber-50'
                }`}
              >
                Kecil / Pas (28%) ★
              </button>
              <button
                type="button"
                onClick={() => setSkala(0.72)}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                  skala > 0.65
                    ? 'border-amber-600 bg-amber-500 text-slate-950 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-amber-50'
                }`}
              >
                Sedang (35%)
              </button>
            </div>

            <input
              type="range"
              min="0.35"
              max="0.85"
              step="0.02"
              value={skala}
              onChange={(e) => setSkala(parseFloat(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              *Rekomendasi 28% agar stempel berada rapi di sudut kiri dan tidak menutupi wajah guru atau siswa.
            </p>
          </div>

          {/* POSISI STEMPEL */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <Move className="w-3.5 h-3.5 text-slate-600" />
              Posisi Stempel di Foto
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPosisi('kiri-bawah')}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                  posisi === 'kiri-bawah'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                Kiri Bawah (Pojok)
              </button>
              <button
                type="button"
                onClick={() => setPosisi('kiri-tengah')}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                  posisi === 'kiri-tengah'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                Kiri Tengah
              </button>
              <button
                type="button"
                onClick={() => setPosisi('kiri-atas')}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                  posisi === 'kiri-atas'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                Kiri Atas
              </button>
            </div>
          </div>

          {/* OPSI CATATAN */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sertakanCatatan}
                onChange={(e) => setSertakanCatatan(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="font-semibold text-slate-800 text-xs">
                Sertakan teks &quot;Catatan Kegiatan&quot; di atas foto
              </span>
            </label>
            <p className="text-[10px] text-slate-500 pl-6 mt-0.5">
              (Biarkan tidak dicentang agar stempel tetap ramping dan tidak memakan tempat vertikal)
            </p>
          </div>

          {/* Label Badge & Jam */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Teks Label Badge (Kuning)
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Evidence Sikawan"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-amber-500 bg-amber-50/20"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-700" />
                Jam Digital
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="11:22"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-blue-900 font-black text-base focus:outline-blue-600 bg-slate-50 font-mono"
              />
              <div className="flex gap-1 mt-1">
                {['07:15', '08:30', '10:00', '11:22', '13:00'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTime(preset)}
                    className="text-[10px] bg-slate-100 hover:bg-amber-100 text-slate-700 px-1.5 py-0.5 rounded font-mono"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tanggal Baris 1 */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              Teks Hari & Tanggal
            </label>
            <input
              type="text"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              placeholder="Rabu, 20/08/2025"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-amber-500"
            />
          </div>

          {/* Alamat Lengkap */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-red-600" />
              Alamat Lokasi Kegiatan
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Kp Jl. Bulak Temu, Sukabudi, Kec. Sukawangi, Kabupaten Bekasi, Jawa Barat 17620"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-amber-500 leading-relaxed font-medium"
            />
          </div>

          {/* Koordinat GPS */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-blue-600" />
                Koordinat GPS
              </label>
              <button
                type="button"
                onClick={handleGetCurrentGps}
                disabled={isGettingGps}
                className="text-[11px] text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1"
              >
                {isGettingGps ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Navigation className="w-3 h-3" />
                )}
                Deteksi GPS Perangkat
              </button>
            </div>
            <input
              type="text"
              value={coords}
              onChange={(e) => setCoords(e.target.value)}
              placeholder="6.139568°S, 107.110048°E"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:outline-amber-500"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 rounded-lg text-xs font-semibold"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleApply}
            disabled={isApplying}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-slate-950 rounded-xl text-xs md:text-sm font-extrabold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            {isApplying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Membubuhkan Stempel...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" /> Terapkan ke Foto
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
