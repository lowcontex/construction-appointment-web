import { Engineer, User, Booking } from '@/types';

export const initialEngineers: Engineer[] = [
  {
    id: 1, name: 'Engr. Marco Santos', spec: 'Civil', avatar: '\u{1F468}\u200D\u{1F4BC}',
    exp: '12 years', rate: 3500, rating: 4.9, reviews: 87, status: 'available',
    skills: ['Foundation', 'Structural', 'Supervision'],
    bio: 'Specializes in residential and light commercial structures.',
  },
  {
    id: 2, name: 'Engr. Ana Reyes', spec: 'Structural', avatar: '\u{1F469}\u200D\u{1F4BC}',
    exp: '9 years', rate: 4000, rating: 4.8, reviews: 64, status: 'available',
    skills: ['Steel Design', 'Seismic', 'High-rise'],
    bio: 'Expert in earthquake-resistant structural design.',
  },
  {
    id: 3, name: 'Engr. Ben Cruz', spec: 'Electrical', avatar: '\u{1F468}\u200D\u{1F527}',
    exp: '8 years', rate: 2800, rating: 4.7, reviews: 112, status: 'busy',
    skills: ['Wiring', 'Solar', 'Panel Design'],
    bio: 'Licensed electrical engineer with solar experience.',
  },
  {
    id: 4, name: 'Engr. Liza Tan', spec: 'Civil', avatar: '\u{1F469}\u200D\u{1F527}',
    exp: '15 years', rate: 4500, rating: 5.0, reviews: 143, status: 'available',
    skills: ['Project Mgmt', 'QC', 'Estimation'],
    bio: 'Senior engineer with 150+ completed projects.',
  },
  {
    id: 5, name: 'Engr. Rico Bautista', spec: 'Mechanical', avatar: '\u{1F468}\u200D\u{1F4BB}',
    exp: '6 years', rate: 3200, rating: 4.6, reviews: 38, status: 'available',
    skills: ['HVAC', 'Plumbing', 'Fire Safety'],
    bio: 'Specializes in mechanical systems for buildings.',
  },
  {
    id: 6, name: 'Engr. Grace Dela Cruz', spec: 'Civil', avatar: '\u{1F469}\u200D\u{1F4BB}',
    exp: '10 years', rate: 3800, rating: 4.8, reviews: 76, status: 'busy',
    skills: ['Roads', 'Drainage', 'Land Dev'],
    bio: 'Infrastructure and subdivision development specialist.',
  },
];

export const initialUsers: User[] = [
  { id: 1, name: 'Admin User', email: 'admin@agudo.com', password: 'admin123', role: 'admin', phone: '' },
  { id: 2, name: 'Marco Santos', email: 'eng@agudo.com', password: 'eng123', role: 'engineer', phone: '' },
];

export const initialBookings: Booking[] = [
  { id: 'BK-001', client: 'Jose Rizal', service: 'House Construction', engineer: 'Engr. Marco Santos', area: 80, total: 2236000, status: 'Confirmed', date: '2025-05-10' },
  { id: 'BK-002', client: 'Maria Clara', service: 'Renovation', engineer: 'Engr. Ana Reyes', area: 45, total: 621000, status: 'Ongoing', date: '2025-05-12' },
  { id: 'BK-003', client: 'Andres Bonifacio', service: 'Electrical Works', engineer: 'Engr. Ben Cruz', area: 60, total: 186000, status: 'Completed', date: '2025-04-28' },
];
