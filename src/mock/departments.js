/**
 * Seed Department and Initial Mentors for Prototype Mock Data
 * Follows spec section 10:
 * Table: departments (id, name, admin_id, created_at)
 */

export const INITIAL_DEPARTMENTS = [
  {
    id: 'dept_cs',
    name: 'Computer Science & Engineering',
    code: 'CSE',
    admin_id: 'user_admin_1',
    admin_name: 'Dr. Sunita Rao',
    description: 'Undergraduate and postgraduate computer science programs including Systems, AI, and Algorithms.',
    created_at: '2026-08-01T10:00:00.000Z',
  },
];

export const INITIAL_DEPARTMENT_MENTORS = [
  {
    id: 'user_mentor_1',
    full_name: 'Prof. Rajesh Verma',
    email: 'mentor@campus.edu',
    role: 'mentor',
    department_id: 'dept_cs',
    created_at: '2026-08-15T09:30:00.000Z',
  },
  {
    id: 'user_mentor_2',
    full_name: 'Dr. Kavita Raman',
    email: 'kavita.raman@campus.edu',
    role: 'mentor',
    department_id: 'dept_cs',
    created_at: '2026-08-16T11:00:00.000Z',
  },
  {
    id: 'user_mentor_3',
    full_name: 'Prof. Alok Nath',
    email: 'alok.nath@campus.edu',
    role: 'mentor',
    department_id: 'dept_cs',
    created_at: '2026-08-18T14:20:00.000Z',
  },
];

export default INITIAL_DEPARTMENTS;
