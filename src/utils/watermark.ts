import { formatTanggalSikawan, extractTimeHHMM } from './dateUtils';

export interface SikawanWatermarkOptions {
  labelEvidence?: string; // e.g. "Evidence Sikawan"
  timeHHMM?: string; // e.g. "11:22"
  dateText?: string; // e.g. "Rabu, 20/08/2025"
  addressText?: string; // e.g. "Kp Jl. Bulak Temu, Sukabudi, Kec. Sukawangi, Kabupaten Bekasi, Jawa Barat 17620"
  coordinates?: string; // e.g. "6.139568°S, 107.110048°E"
  catatanText?: string; // optional note/activity description
  sertakanCatatan?: boolean; // default: false (to avoid covering the photo)
  kodeFoto?: string; // e.g. "BU4G6HT4NWN2MD"
  skala?: number; // scale multiplier, default 0.58 (compact ~28% width)
  posisi?: 'kiri-bawah' | 'kiri-tengah' | 'kiri-atas';
}

// Cached image assets
let cachedCardHd: HTMLImageElement | null = null;
let cachedAvatarHd: HTMLImageElement | null = null;

function loadAsset(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function getCardHd(): Promise<HTMLImageElement | null> {
  if (cachedCardHd && cachedCardHd.complete && cachedCardHd.naturalWidth > 0) {
    return cachedCardHd;
  }
  cachedCardHd = await loadAsset('/assets/aistudio/sikawan_card_hd.png');
  return cachedCardHd;
}

async function getAvatarHd(): Promise<HTMLImageElement | null> {
  if (cachedAvatarHd && cachedAvatarHd.complete && cachedAvatarHd.naturalWidth > 0) {
    return cachedAvatarHd;
  }
  cachedAvatarHd = await loadAsset('/assets/aistudio/sikawan_avatar_hd.png');
  return cachedAvatarHd;
}

/**
 * Splits text into wrapped lines for canvas
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const w of words) {
    const test = current ? `${current} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = w;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Splits address lines matching the reference breakdown
 */
function parseAddressLines(addressText?: string): string[] {
  if (
    !addressText ||
    addressText.toLowerCase().includes('bulak temu') ||
    addressText.toLowerCase().includes('sukawangi')
  ) {
    return [
      'Kp Jl. Bulak Temu, Sukabudi, Kec.',
      'Sukawangi, Kabupaten Bekasi, Jawa Barat',
      '17620',
    ];
  }

  if (addressText.includes('\n')) {
    return addressText.split('\n').map((l) => l.trim()).filter(Boolean);
  }

  const postalMatch = addressText.match(/(\d{5})$/);
  const postalCode = postalMatch ? postalMatch[1] : null;
  const cleanAddr = postalCode ? addressText.replace(/\s*\d{5}$/, '').trim() : addressText;

  const words = cleanAddr.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const w of words) {
    const test = current ? `${current} ${w}` : w;
    if (test.length > 36 && current) {
      lines.push(current);
      current = w;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  if (postalCode) lines.push(postalCode);

  return lines;
}

/**
 * Applies the PROPORTIONAL, COMPACT Evidence Sikawan timestamp
 * Designed specifically so it NEVER covers or obstructs classroom photos.
 */
export async function applyWatermarkToImage(
  file: File | Blob,
  options: SikawanWatermarkOptions = {}
): Promise<{ dataUrl: string; stampText: string }> {
  const [cardImg, avatarImg] = await Promise.all([getCardHd(), getAvatarHd()]);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context tidak tersedia'));
          return;
        }

        // Limit maximum dimensions for performance & crisp PDF printing
        const MAX_WIDTH = 1280;
        const MAX_HEIGHT = 960;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw original uploaded photo
        ctx.drawImage(img, 0, 0, width, height);

        // User configurable scale factor (default 0.58 = ~28% width, sleek & compact)
        const userScale = Math.max(0.35, Math.min(1.0, options.skala ?? 0.58));
        const posisi = options.posisi ?? 'kiri-bawah';
        const sertakanCatatan = options.sertakanCatatan ?? false;

        // PROPORTIONAL SIZING:
        // By default width ratio is 0.486 * userScale (e.g. 0.486 * 0.58 = 0.282 / ~28% of photo width)
        const cardW = Math.round(width * 0.486 * userScale);
        const cardH = Math.round(cardW * (104 / 622));
        const fontScale = cardW / 622; // Ratio relative to original 622px HD card asset

        // Extract options
        const labelTag = options.labelEvidence || 'Evidence Sikawan';
        const timeStr = options.timeHHMM || '11:22';
        const dateStr = options.dateText || 'Rabu, 20/08/2025';
        const addressLines = parseAddressLines(options.addressText);
        const coordsStr = options.coordinates || '6.139568°S, 107.110048°E';
        const kodeFoto = options.kodeFoto || 'BU4G6HT4NWN2MD';

        // Typography sizes scaled compactly
        const dateFontSize = Math.max(12, Math.round(27 * fontScale));
        const textFontSize = Math.max(10, Math.round(24 * fontScale));
        const coordsFontSize = Math.max(9, Math.round(22 * fontScale));
        const lineHeight = Math.round(textFontSize * 1.34);
        const barWidth = Math.max(2.5, Math.round(6 * fontScale));
        const gapBetweenCardAndText = Math.round(14 * fontScale);
        const textIndent = barWidth + Math.round(10 * fontScale);

        // Calculate height of text section
        const afterDateGap = Math.round(6 * fontScale);
        const afterAddressGap = Math.round(4 * fontScale);
        const barHeight =
          dateFontSize +
          afterDateGap +
          addressLines.length * lineHeight +
          afterAddressGap +
          coordsFontSize;

        // Optional Catatan
        let catatanLines: string[] = [];
        let catatanHeight = 0;
        if (sertakanCatatan && options.catatanText) {
          ctx.font = `600 ${textFontSize}px system-ui, -apple-system, sans-serif`;
          catatanLines = wrapText(
            ctx,
            `Catatan: ${options.catatanText}`,
            Math.round(cardW * 1.05)
          );
          catatanHeight = Math.round(12 * fontScale) + catatanLines.length * lineHeight;
        }

        const kodeHeight = Math.round(18 * fontScale);
        const totalWidgetHeight =
          cardH + gapBetweenCardAndText + barHeight + catatanHeight + kodeHeight;

        // Position Calculation (Compact & Unobtrusive)
        const cardX = Math.round(width * 0.022);
        let cardY: number;

        if (posisi === 'kiri-bawah') {
          // Anchored near bottom-left corner with comfortable margin
          cardY = Math.max(
            Math.round(height * 0.03),
            height - totalWidgetHeight - Math.round(height * 0.035)
          );
        } else if (posisi === 'kiri-tengah') {
          cardY = Math.round((height - totalWidgetHeight) / 2);
        } else {
          // kiri-atas
          cardY = Math.round(height * 0.03);
        }

        /* ==============================================================
         * 1. TOP-RIGHT "Timemark" BRANDING (Proportional & Subtle)
         * ============================================================== */
        const timemarkScale = (width / 1280) * userScale * 1.35;
        const timemarkFontSize = Math.max(12, Math.round(22 * timemarkScale));
        const subTimemarkFontSize = Math.max(8, Math.round(12 * timemarkScale));

        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        ctx.font = `800 ${timemarkFontSize}px system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = '#ffb703';
        ctx.textAlign = 'right';
        ctx.fillText(
          'Timemark',
          width - Math.round(16 * userScale * (width / 1280) + 10),
          Math.round(24 * timemarkScale)
        );

        ctx.font = `500 ${subTimemarkFontSize}px system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(
          'Foto 100% akurat',
          width - Math.round(16 * userScale * (width / 1280) + 10),
          Math.round(24 * timemarkScale) + Math.round(16 * timemarkScale)
        );
        ctx.restore();

        /* ==============================================================
         * 2. TOP CARD BADGE: [ Evidence Sikawan | 11:22 | Avatar ]
         * ============================================================== */
        const isDefaultLabel = labelTag === 'Evidence Sikawan';
        const isDefaultTime = timeStr === '11:22';

        if (cardImg && isDefaultLabel && isDefaultTime) {
          ctx.drawImage(cardImg, cardX, cardY, cardW, cardH);
        } else if (cardImg) {
          ctx.drawImage(cardImg, cardX, cardY, cardW, cardH);

          // If label changed, overwrite yellow pill
          if (!isDefaultLabel) {
            const pillX = cardX;
            const pillY = cardY;
            const pillW = Math.round(cardW * 0.485);
            const pillH = cardH;

            ctx.save();
            ctx.fillStyle = '#ffb703';
            const pillRadius = 8 * fontScale;
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(pillX, pillY, pillW, pillH, pillRadius);
            else ctx.rect(pillX, pillY, pillW, pillH);
            ctx.fill();

            ctx.fillStyle = '#0a0a0a';
            ctx.font = `800 ${Math.max(10, Math.round(26 * fontScale))}px "Plus Jakarta Sans", "Arial Black", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(labelTag, pillX + pillW / 2, pillY + pillH / 2);
            ctx.restore();
          }

          // If time changed, overwrite time digits with pattern and write new time
          if (!isDefaultTime) {
            const timeAreaX = cardX + Math.round(cardW * 0.485);
            const timeAreaY = cardY;
            const timeAreaW = Math.round(cardW * 0.38);
            const timeAreaH = cardH;

            ctx.save();
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(timeAreaX, timeAreaY, timeAreaW, timeAreaH);

            // Subtle pinstripes
            ctx.strokeStyle = '#f1f5f9';
            ctx.lineWidth = 1;
            for (let i = -timeAreaH; i < timeAreaW; i += Math.round(6 * fontScale)) {
              ctx.beginPath();
              ctx.moveTo(timeAreaX + i, timeAreaY);
              ctx.lineTo(timeAreaX + i + timeAreaH, timeAreaY + timeAreaH);
              ctx.stroke();
            }

            // Draw new time in dark navy blue gradient
            const grad = ctx.createLinearGradient(
              timeAreaX,
              timeAreaY,
              timeAreaX,
              timeAreaY + timeAreaH
            );
            grad.addColorStop(0, '#0c2461');
            grad.addColorStop(1, '#001233');

            ctx.fillStyle = grad;
            ctx.font = `900 ${Math.max(18, Math.round(54 * fontScale))}px "Plus Jakarta Sans", "Arial Black", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(timeStr, timeAreaX + timeAreaW / 2, timeAreaY + timeAreaH / 2);
            ctx.restore();
          }
        } else {
          // Procedural fallback
          ctx.save();
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
          ctx.shadowBlur = 6;
          ctx.shadowOffsetY = 2;
          const r = 8 * fontScale;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(cardX, cardY, cardW, cardH, r);
          else ctx.rect(cardX, cardY, cardW, cardH);
          ctx.fill();
          ctx.restore();

          const pillW = Math.round(cardW * 0.48);
          ctx.fillStyle = '#ffb703';
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(cardX, cardY, pillW, cardH, r);
          else ctx.rect(cardX, cardY, pillW, cardH);
          ctx.fill();

          ctx.fillStyle = '#0a0a0a';
          ctx.font = `800 ${Math.max(10, Math.round(25 * fontScale))}px "Plus Jakarta Sans", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(labelTag, cardX + pillW / 2, cardY + cardH / 2);

          ctx.fillStyle = '#0c2461';
          ctx.font = `900 ${Math.max(16, Math.round(50 * fontScale))}px "Plus Jakarta Sans", sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(timeStr, cardX + pillW + Math.round(cardW * 0.18), cardY + cardH / 2);

          if (avatarImg) {
            const avW = Math.round(cardW * 0.12);
            ctx.drawImage(
              avatarImg,
              cardX + cardW - avW - 6 * fontScale,
              cardY + 4 * fontScale,
              avW,
              cardH - 8 * fontScale
            );
          }
        }

        /* ==============================================================
         * 3. BOTTOM-LEFT INFORMATION OVERLAY
         *    - Yellow Vertical Line (|)
         *    - Date Line
         *    - Address Lines
         *    - Coordinates Line
         *    - Optional Catatan
         *    - Kode Foto
         * ============================================================== */
        const barX = cardX;
        const barY = cardY + cardH + gapBetweenCardAndText;
        const textX = barX + textIndent;

        // 3A. Draw Yellow Vertical Accent Bar
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.fillStyle = '#ffb703';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.restore();

        // 3B. Draw Text with Strong Drop Shadow
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.96)';
        ctx.shadowBlur = Math.max(3, Math.round(3.5 * fontScale));
        ctx.shadowOffsetX = Math.max(1, Math.round(1.2 * fontScale));
        ctx.shadowOffsetY = Math.max(1, Math.round(1.2 * fontScale));

        // Line 1: Date: "Rabu, 20/08/2025"
        ctx.fillStyle = '#ffffff';
        ctx.font = `800 ${dateFontSize}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        let curY = barY;
        ctx.fillText(dateStr, textX, curY);

        curY += dateFontSize + afterDateGap;

        // Lines 2-4: Address Lines
        ctx.font = `600 ${textFontSize}px system-ui, -apple-system, sans-serif`;
        for (const line of addressLines) {
          ctx.fillText(line, textX, curY);
          curY += lineHeight;
        }

        // Line 5: Coordinates Line
        curY += afterAddressGap;
        ctx.font = `500 ${coordsFontSize}px system-ui, -apple-system, sans-serif`;
        ctx.fillText(coordsStr, textX, curY);

        curY += coordsFontSize + Math.round(10 * fontScale);

        // Optional Catatan
        if (sertakanCatatan && catatanLines.length > 0) {
          ctx.font = `600 ${textFontSize}px system-ui, -apple-system, sans-serif`;
          for (const line of catatanLines) {
            ctx.fillText(line, textX, curY);
            curY += lineHeight;
          }
          curY += Math.round(8 * fontScale);
        }

        // Bottom Kode Foto with Badge
        const codeFontSize = Math.max(9, Math.round(18 * fontScale));
        ctx.font = `600 ${codeFontSize}px system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText(`✓ Kode Foto: ${kodeFoto}`, textX, curY);

        ctx.restore();

        // Export as High-Quality JPEG
        const dataUrl = canvas.toDataURL('image/jpeg', 0.93);
        const stampText = `${labelTag} • ${timeStr} • ${dateStr}`;
        resolve({ dataUrl, stampText });
      };

      img.onerror = () => {
        reject(new Error('Gagal memproses gambar bukti'));
      };

      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      } else {
        reject(new Error('Format file tidak didukung'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Gagal membaca file foto'));
    };

    reader.readAsDataURL(file);
  });
}
