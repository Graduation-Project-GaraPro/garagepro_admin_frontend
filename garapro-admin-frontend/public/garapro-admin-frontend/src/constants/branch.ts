// constants/branch.ts
import { OperatingHour } from '@/services/branch-service'

export const DEFAULT_OPERATING_HOURS: OperatingHour[] = [
  { dayOfWeek: 1, isOpen: true, openTime: '08:00', closeTime: '17:00' },
  { dayOfWeek: 2, isOpen: true, openTime: '08:00', closeTime: '17:00' },
  { dayOfWeek: 3, isOpen: true, openTime: '08:00', closeTime: '17:00' },
  { dayOfWeek: 4, isOpen: true, openTime: '08:00', closeTime: '17:00' },
  { dayOfWeek: 5, isOpen: true, openTime: '08:00', closeTime: '17:00' },
  { dayOfWeek: 6, isOpen: true, openTime: '08:00', closeTime: '17:00' },
  { dayOfWeek: 7, isOpen: false, openTime: '08:00', closeTime: '17:00' },
]