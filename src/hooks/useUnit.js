import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const s = (await base44.entities.UnitSettings.filter({}, { limit: 1 })).items[0] || null;
      if (s?.stamp) {
        try {
          const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: s.stamp });
          s.stampUrl = signed_url;
        } catch {}
      }
      return s;
    },
  });
}

export function useVessels() {
  return useQuery({
    queryKey: ['vessels'],
    queryFn: async () => (await base44.entities.Vessel.filter({}, { sort: 'name', limit: 100 })).items,
  });
}