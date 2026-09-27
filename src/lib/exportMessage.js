import { MESSAGE_TYPES, MISSION_CHAPTERS } from '@/lib/messageTypes';
import { gdh, refLine, fmtDate, pad3 } from '@/lib/format';

function bodyToText(lines) {
  return lines.map((l) => `${l.indent ? '  ' : ''}${l.label ? `${l.label} : ` : ''}${l.sub ? `${l.sub} : ` : ''}${l.text || ''}`).join('\n');
}

function missionToText(message, s) {
  const f = message.fields || {};
  return [
    s.unit_name || '',
    refLine(message, s),
    '',
    'COMPTE-RENDU DE MISSION',
    (f.vessel || '').toUpperCase(),
    `du ${fmtDate(f.from)} au ${fmtDate(f.to)}`,
    '',
    ...MISSION_CHAPTERS.map((c) => `CHAPITRE "${c.key}" — ${c.title.toUpperCase()}\n${f[`chap_${c.key}`] || 'Néant.'}`),
    '',
    `Fait à ${s.place}, le ${fmtDate(message.date)}`,
    s.commander || '',
  ].join('\n');
}

export function messageToText(message, settings) {
  const s = settings || {};
  const T = MESSAGE_TYPES[message.type];
  if (T?.kind === 'document') return missionToText(message, s);
  const body = [
    { text: `${refLine(message, s)} STOP` },
    ...T.build(message.fields || {}),
    { text: `ET FIN ${s.commander || ''}` },
  ];
  return [
    `MESSAGE ${T.name}`,
    `AUTORITE ORIGINE : ${s.origin || ''}`,
    `GROUPE DATE-HEURE : ${gdh(message.gdh)}`,
    `CLASSIFICATION : ${message.classification}`,
    `URGENCE : ${message.urgency}`,
    `POUR ACTION : ${message.to}`,
    `POUR INFORMATION : ${message.info}`,
    '',
    'BT',
    bodyToText(body),
    'BT',
    '',
    `${s.unit_name || ''} - Tel: ${s.tel || ''} - Email: ${s.email || ''}`,
  ].join('\n');
}

export function fileSlug(message) {
  const T = MESSAGE_TYPES[message.type];
  return `${T.name}_${pad3(message.number)}_${message.date || ''}`.replace(/\s+/g, '-');
}

export function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function exportToFolder(messages, settings) {
  if (window.showDirectoryPicker) {
    try {
      const dir = await window.showDirectoryPicker({ mode: 'readwrite' });
      for (const m of messages) {
        const fh = await dir.getFileHandle(`${fileSlug(m)}.txt`, { create: true });
        const w = await fh.createWritable();
        await w.write(messageToText(m, settings));
        await w.close();
      }
      return { folder: true, count: messages.length };
    } catch (e) {
      if (e.name === 'AbortError') return { aborted: true };
    }
  }
  for (const m of messages) downloadText(`${fileSlug(m)}.txt`, messageToText(m, settings));
  return { folder: false, count: messages.length };
}