import { jsPDF } from 'jspdf';
import { messageToText } from '@/lib/exportMessage';

// Convertit le DOM de l'aperçu (.sheet) en PDF via html2canvas.
async function elementToPdf(element) {
  const html2canvas = (await import('html2canvas')).default;
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
  });
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageW = 210;
  const pageH = 297;
  const imgW = pageW;
  const imgH = (canvas.height * imgW) / canvas.width;
  const imgData = canvas.toDataURL('image/png');
  let heightLeft = imgH;
  let position = 0;
  pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH);
  heightLeft -= pageH;
  while (heightLeft > 0) {
    position -= pageH;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH);
    heightLeft -= pageH;
  }
  return pdf;
}

// Repli : PDF texte brut (sans mise en page ni cachet).
function textToPdf(text) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  pdf.setFontSize(11);
  const lines = pdf.splitTextToSize(text, 190);
  let y = 20;
  for (const line of lines) {
    if (y > 280) {
      pdf.addPage();
      y = 20;
    }
    pdf.text(line, 10, y);
    y += 6;
  }
  return pdf;
}

function blobToBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(blob);
  });
}

async function shareOrDownload(blob, filename) {
  // 1. Application native (APK Capacitor) : écriture fichier + partage natif
  try {
    const { Share } = await import('@capacitor/share');
    const { Filesystem, Directory } = await import('@capacitor/filesystem');
    const base64 = await blobToBase64(blob);
    const path = `DISAC/${filename}`;
    await Filesystem.writeFile({
      path,
      data: base64,
      directory: Directory.Cache,
      recursive: true,
    });
    const { uri } = await Filesystem.getUri({ path, directory: Directory.Cache });
    await Share.share({ url: uri, title: filename });
    return { shared: true };
  } catch (e) {
    if (e?.name === 'AbortError') return { aborted: true };
    // sinon repli web
  }
  // 2. Navigateur mobile : Web Share API avec fichier
  const file = new File([blob], filename, { type: 'application/pdf' });
  if (typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename });
      return { shared: true };
    } catch (e) {
      if (e?.name === 'AbortError') return { aborted: true };
    }
  }
  // 3. Repli universel : téléchargement
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return { downloaded: true };
}

export async function exportMessagePdf(element, message, settings, filename) {
  let pdf;
  try {
    if (element) pdf = await elementToPdf(element);
    else throw new Error('no element');
  } catch {
    pdf = textToPdf(messageToText(message, settings));
  }
  const blob = pdf.output('blob');
  return shareOrDownload(blob, filename);
}