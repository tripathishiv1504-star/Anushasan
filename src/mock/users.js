/**
 * Seed users for prototype mock authentication
 * Field names strictly match spec section 10 (snake_case).
 */

export const INITIAL_USERS = [
  {
    id: 'user_student_1',
    full_name: 'Aarav Sharma',
    email: 'student@campus.edu',
    password: 'Password123',
    role: 'student',
    study_mode: 'class',
    department_id: 'dept_cs',
    created_at: '2026-09-01T08:00:00.000Z',
  },
  {
    id: 'user_student_solo',
    full_name: 'Priya Patel',
    email: 'solo@campus.edu',
    password: 'Password123',
    role: 'student',
    study_mode: 'solo',
    department_id: null,
    created_at: '2026-09-05T08:00:00.000Z',
  },
  {
    id: 'user_mentor_1',
    full_name: 'Prof. Rajesh Verma',
    email: 'mentor@campus.edu',
    password: 'Password123',
    role: 'mentor',
    study_mode: null,
    department_id: 'dept_cs',
    created_at: '2026-08-15T09:30:00.000Z',
  },
  {
    id: 'user_mentor_2',
    full_name: 'Dr. Kavita Raman',
    email: 'kavita.raman@campus.edu',
    password: 'Password123',
    role: 'mentor',
    study_mode: null,
    department_id: 'dept_cs',
    created_at: '2026-08-16T11:00:00.000Z',
  },
  {
    id: 'user_mentor_3',
    full_name: 'Prof. Alok Nath',
    email: 'alok.nath@campus.edu',
    password: 'Password123',
    role: 'mentor',
    study_mode: null,
    department_id: 'dept_cs',
    created_at: '2026-08-18T14:20:00.000Z',
  },
  {
    id: 'user_admin_1',
    full_name: 'Dr. Sunita Rao',
    email: 'admin@campus.edu',
    password: 'Password123',
    role: 'admin',
    study_mode: null,
    department_id: 'dept_cs',
    created_at: '2026-08-01T10:00:00.000Z',
  },
];

export default INITIAL_USERS;
