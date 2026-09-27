import MessageBody from '@/components/message/MessageBody';
import { Image } from '@/components/ui/image';
import { MESSAGE_TYPES, CLASSIFICATIONS, URGENCIES } from '@/lib/messageTypes';
import { gdh, refLine } from '@/lib/format';

const cell = 'border border-foreground/80 px-2 py-1 align-top';

export default function MessageSheet({ message, settings }) {
  const s = settings || {};
  const body = [
    { text: `${refLine(message, s)} STOP` },
    ...MESSAGE_TYPES[message.type].build(message.fields || {}),
    { text: `ET FIN ${s.commander || ''}` },
  ];
  return (
    <div className="sheet bg-card text-card-foreground font-sans text-[11px] leading-snug">
      <table className="w-full border-collapse">
        <tbody>
          <tr>
            <td className={cell}>N° d'enregistrement et heure de dépôt</td>
            <td colSpan={2} className={`${cell} text-center font-bold tracking-[0.4em] align-middle`}>MESSAGE</td>
            <td className={`${cell} text-center align-middle`}>GROUPE</td>
          </tr>
          <tr><td colSpan={4} className={`${cell} text-center tracking-[0.3em] text-[9px]`}>RESERVE AUX TRANSMISSIONS AU DESSUS DE CETTE LIGNE</td></tr>
          <tr>
            <td className={`${cell} text-center align-middle`}><div className="font-bold underline">AUTORITE ORIGINE (FM) :</div><div className="mt-3">{s.origin}</div></td>
            <td className={`${cell} text-center align-middle`}><div className="font-bold underline">GROUPE – DATE - HEURE</div><div className="mt-3">{gdh(message.gdh)}</div></td>
            <td className={`${cell} p-0 w-[26%]`}>
              {CLASSIFICATIONS.map((c) => <div key={c} className={`px-2 py-0.5 border-b last:border-b-0 border-foreground/80 ${c === message.classification ? 'font-bold' : ''}`}>{c}</div>)}
            </td>
            <td className={`${cell} p-0 w-[18%]`}>
              {URGENCIES.map(([k, l]) => <div key={k} className={`px-2 py-0.5 border-b last:border-b-0 border-foreground/80 ${k === message.urgency ? 'font-bold' : ''}`}>{l}</div>)}
            </td>
          </tr>
          <tr>
            <td colSpan={4} className={`${cell} py-2`}>
              <div className="text-center font-bold underline mb-1">AUTORITES DESTINATAIRES</div>
              <div><b className="underline">POUR ACTION (TO)</b> : {message.to}</div>
              <div><b className="underline">POUR INFORMATION</b> : {message.info}</div>
              <div className="font-bold mt-1">BT</div>
              <MessageBody lines={body} />
              <div className="font-bold">BT</div>
            </td>
          </tr>
        </tbody>
      </table>
      <table className="w-full border-collapse -mt-px">
        <tbody>
          <tr>
            <td className={`${cell} text-center w-1/3`}>Instruction à ne pas transmettre</td>
            <td className={`${cell} text-center w-1/3`}>Instruction pour le message</td>
            <td rowSpan={2} className={cell}></td>
          </tr>
          <tr className="h-28">
            <td className={cell}>Grade, nom et signature du rédacteur ou l'opérateur</td>
            <td className={cell}>
              <div>{s.unit_name}</div>
              <div>Tel : {s.tel}</div>
              <div>Email : {s.email}</div>
              {s.stampUrl && <div className="mt-2 flex justify-end"><Image src={s.stampUrl} alt="Cachet" className="w-20 h-20 object-contain" fittingType="fit" /></div>}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}