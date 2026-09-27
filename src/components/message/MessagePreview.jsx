import MessageSheet from '@/components/message/MessageSheet';
import MissionDoc from '@/components/message/MissionDoc';
import { MESSAGE_TYPES } from '@/lib/messageTypes';

export default function MessagePreview({ message, settings }) {
  const Doc = MESSAGE_TYPES[message.type]?.kind === 'document' ? MissionDoc : MessageSheet;
  return (
    <div className="overflow-x-auto print:overflow-visible">
      <div className="min-w-[620px] print:min-w-0">
        <Doc message={message} settings={settings} />
      </div>
    </div>
  );
}