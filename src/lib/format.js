const MONTHS = ['JAN', 'FEV', 'MAR', 'AVR', 'MAI', 'JUN', 'JUL', 'AOU', 'SEP', 'OCT', 'NOV', 'DEC'];

export const pad3 = (n) => String(n ?? 0).padStart(3, '0');

export function fmtDate(iso) {
  if (!iso) return '../../..';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y.slice(2)}`;
}

export function gdh(dt) {
  if (!dt) return '';
  const [date, time = '00:00'] = dt.split('T');
  const [, m, d] = date.split('-');
  return `ZII ${MONTHS[+m - 1]} ${d}/${time.replace(':', '').slice(0, 4)}C`;
}

export function localISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function nowLocal() {
  const d = new Date();
  return new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export function weekRange() {
  const day = (new Date().getDay() + 6) % 7;
  return { monday: localISO(-day), sunday: localISO(6 - day) };
}

export const refLine = (m, s) =>
  `NR ${pad3(m.number)} ${s?.ref_suffix || ''} DU ${fmtDate(m.date)}`;