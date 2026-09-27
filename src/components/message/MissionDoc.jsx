import { Image } from '@/components/ui/image';
import { MISSION_CHAPTERS } from '@/lib/messageTypes';
import { fmtDate, refLine } from '@/lib/format';

export default function MissionDoc({ message, settings }) {
  const f = message.fields || {};
  const s = settings || {};
  return (
    <div className="sheet bg-card text-card-foreground p-6 md:p-10 text-[12px] leading-relaxed">
      <div className="text-[10px] uppercase">{s.unit_name}<br />{refLine(message, s)}</div>
      <h1 className="text-center font-bold underline mt-8 text-sm">COMPTE-RENDU DE MISSION</h1>
      <div className="text-center uppercase font-semibold">{f.vessel || 'NOM DU BATIMENT'}</div>
      <div className="text-center text-[11px]">du {fmtDate(f.from)} au {fmtDate(f.to)}</div>
      {MISSION_CHAPTERS.map((c) => (
        <section key={c.key} className="mt-6 break-inside-avoid">
          <div className="text-center"><div className="underline">CHAPITRE "{c.key}"</div><div className="uppercase">{c.title}</div></div>
          <p className="whitespace-pre-wrap mt-2">{f[`chap_${c.key}`] || 'Néant.'}</p>
          <div className="border-b border-foreground/60 mt-4" />
        </section>
      ))}
      <div className="mt-10 ml-auto w-fit text-center">
        <div>Fait à {s.place}, le {fmtDate(message.date)}</div>
        {s.stampUrl && <Image src={s.stampUrl} alt="Cachet" className="w-24 h-24 object-contain mx-auto mt-3" fittingType="fit" />}
        <div className="font-bold mt-3 uppercase">{s.commander}</div>
      </div>
    </div>
  );
}