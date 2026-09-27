import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => (await base44.entities.UnitSettings.filter({}, { limit: 1 })).items[0] || null,
  });
}

export function useVessels() {
  return useQuery({
    queryKey: ['vessels'],
    queryFn: async () => (await base44.entities.Vessel.filter({}, { sort: 'name', limit: 100 })).items,
  });
}