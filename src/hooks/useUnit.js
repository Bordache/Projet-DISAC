import { useQuery } from '@tanstack/react-query';
import { db, getSettings, getStampUrl } from '@/lib/localDb';

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const s = await getSettings();
      if (s?.stamp) {
        try { s.stampUrl = await getStampUrl(); } catch {}
      }
      return s;
    },
  });
}

export function useVessels() {
  return useQuery({
    queryKey: ['vessels'],
    queryFn: async () => (await db.vessels.filter({}, { sort: 'name', limit: 100 })).items,
  });
}