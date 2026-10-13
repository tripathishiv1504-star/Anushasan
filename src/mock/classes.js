/**
 * Seed classes and initial memberships for prototype
 * Field names strictly match spec section 10 (snake_case).
 */

export const INITIAL_CLASSES = [
  {
    id: 'class_os_301',
    name: 'Operating Systems & Architecture',
    subject: 'Computer Science',
    mentor_id: 'user_mentor_1',
    mentor_name: 'Prof. Rajesh Verma',
    department_id: 'dept_cs',
    join_code: 'CS301A',
    created_at: '2026-08-20T10:00:00.000Z',
  },
  {
    id: 'class_dsa_201',
    name: 'Data Structures & Algorithms',
    subject: 'Computer Science',
    mentor_id: 'user_mentor_1',
    mentor_name: 'Prof. Rajesh Verma',
    department_id: 'dept_cs',
    join_code: 'DS201B',
    created_at: '2026-08-20T11:00:00.000Z',
  },
  {
    id: 'class_db_202',
    name: 'Database Management Systems',
    subject: 'Computer Science',
    mentor_id: 'user_mentor_2',
    mentor_name: 'Dr. Kavita Raman',
    department_id: 'dept_cs',
    join_code: 'DB202K',
    created_at: '2026-08-21T10:00:00.000Z',
  },
  {
    id: 'class_ml_401',
    name: 'Machine Learning Foundations',
    subject: 'Artificial Intelligence',
    mentor_id: 'user_admin_1',
    mentor_name: 'Dr. Sunita Rao',
    department_id: 'dept_cs',
    join_code: 'AI401C',
    created_at: '2026-08-22T09:00:00.000Z',
  },
];

export const INITIAL_CLASS_MEMBERS = [
  {
    id: 'member_1',
    class_id: 'class_os_301',
    student_id: 'user_student_1',
    joined_at: '2026-09-02T10:00:00.000Z',
  },
];

export default INITIAL_CLASSES;
