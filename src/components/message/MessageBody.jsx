function Rich({ text }) {
  return (text || '').split(/(\bSTOP\b|\bET FIN\b)/gi).map((p, i) =>
    /^(STOP|ET FIN)$/i.test(p) ? <b key={i}>{p}</b> : <span key={i}>{p}</span>
  );
}

export default function MessageBody({ lines }) {
  return (
    <div className="uppercase">
      {lines.map((l, i) => (
        <div key={i} className={l.indent ? 'pl-5' : ''}>
          {l.label && <><b className="underline">{l.label}</b> : </>}
          {l.sub && <><b className="underline">{l.sub}</b> : </>}
          <Rich text={l.text} />
        </div>
      ))}
    </div>
  );
}