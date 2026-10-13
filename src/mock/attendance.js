/**
 * Seed Attendance Records & Weekly Timetable for Prototype Mock Data
 * Field names strictly follow spec section 10:
 * id, class_id, student_id, session_date, status ('present' | 'absent' | 'late')
 */

function getAttendanceDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateSeedAttendance() {
  const records = [];

  // Seed 14 sessions across recent 4 weeks for user_student_1
  // Status: 12 present, 1 late, 1 absent => 13 attended / 14 = 92.8% attendance
  records.push(
    { id: 'att_01', class_id: 'class_os_301', class_code: 'CS301A', subject: 'Operating Systems', student_id: 'user_student_1', session_date: getAttendanceDate(1), status: 'present', period: '09:30 AM - 10:30 AM' },
    { id: 'att_02', class_id: 'class_dsa_201', class_code: 'DS201B', subject: 'Data Structures', student_id: 'user_student_1', session_date: getAttendanceDate(2), status: 'present', period: '11:00 AM - 12:30 PM' },
    { id: 'att_03', class_id: 'class_os_301', class_code: 'CS301A', subject: 'Operating Systems', student_id: 'user_student_1', session_date: getAttendanceDate(4), status: 'present', period: '09:30 AM - 10:30 AM' },
    { id: 'att_04', class_id: 'class_dsa_201', class_code: 'DS201B', subject: 'Data Structures Lab', student_id: 'user_student_1', session_date: getAttendanceDate(6), status: 'late', period: '10:00 AM - 12:00 PM' },
    { id: 'att_05', class_id: 'class_os_301', class_code: 'CS301A', subject: 'Operating Systems', student_id: 'user_student_1', session_date: getAttendanceDate(8), status: 'present', period: '09:30 AM - 10:30 AM' },
    { id: 'att_06', class_id: 'class_dsa_201', class_code: 'DS201B', subject: 'Data Structures', student_id: 'user_student_1', session_date: getAttendanceDate(10), status: 'present', period: '11:00 AM - 12:30 PM' },
    { id: 'att_07', class_id: 'class_os_301', class_code: 'CS301A', subject: 'OS Systems Lab', student_id: 'user_student_1', session_date: getAttendanceDate(13), status: 'absent', period: '02:00 PM - 04:00 PM' },
    { id: 'att_08', class_id: 'class_dsa_201', class_code: 'DS201B', subject: 'Data Structures', student_id: 'user_student_1', session_date: getAttendanceDate(15), status: 'present', period: '11:00 AM - 12:30 PM' },
    { id: 'att_09', class_id: 'class_os_301', class_code: 'CS301A', subject: 'Operating Systems', student_id: 'user_student_1', session_date: getAttendanceDate(18), status: 'present', period: '09:30 AM - 10:30 AM' },
    { id: 'att_10', class_id: 'class_dsa_201', class_code: 'DS201B', subject: 'Data Structures Lab', student_id: 'user_student_1', session_date: getAttendanceDate(20), status: 'present', period: '10:00 AM - 12:00 PM' },
    { id: 'att_11', class_id: 'class_os_301', class_code: 'CS301A', subject: 'Operating Systems', student_id: 'user_student_1', session_date: getAttendanceDate(22), status: 'present', period: '09:30 AM - 10:30 AM' },
    { id: 'att_12', class_id: 'class_dsa_201', class_code: 'DS201B', subject: 'Data Structures', student_id: 'user_student_1', session_date: getAttendanceDate(24), status: 'present', period: '11:00 AM - 12:30 PM' },
    { id: 'att_13', class_id: 'class_os_301', class_code: 'CS301A', subject: 'Operating Systems', student_id: 'user_student_1', session_date: getAttendanceDate(26), status: 'present', period: '09:30 AM - 10:30 AM' },
    { id: 'att_14', class_id: 'class_dsa_201', class_code: 'DS201B', subject: 'Data Structures', student_id: 'user_student_1', session_date: getAttendanceDate(28), status: 'present', period: '11:00 AM - 12:30 PM' }
  );

  return records;
}

export const INITIAL_ATTENDANCE_RECORDS = generateSeedAttendance();

export const INITIAL_TIMETABLE = [
  {
    id: 'tt_1',
    class_id: 'class_os_301',
    class_code: 'CS301A',
    subject: 'Operating Systems & Architecture',
    day_of_week: 'Monday',
    day_index: 1,
    start_time: '09:30 AM',
    end_time: '10:30 AM',
    room: 'Hall CS-204',
    type: 'Lecture',
    mentor_name: 'Prof. Rajesh Verma',
  },
  {
    id: 'tt_2',
    class_id: 'class_dsa_201',
    class_code: 'DS201B',
    subject: 'Data Structures & Algorithms',
    day_of_week: 'Monday',
    day_index: 1,
    start_time: '11:00 AM',
    end_time: '12:30 PM',
    room: 'Hall CS-101',
    type: 'Lecture',
    mentor_name: 'Prof. Rajesh Verma',
  },
  {
    id: 'tt_3',
    class_id: 'class_dsa_201',
    class_code: 'DS201B',
    subject: 'Data Structures Lab (Hands-on)',
    day_of_week: 'Tuesday',
    day_index: 2,
    start_time: '10:00 AM',
    end_time: '12:00 PM',
    room: 'Computing Lab 2',
    type: 'Lab',
    mentor_name: 'Prof. Rajesh Verma',
  },
  {
    id: 'tt_4',
    class_id: 'class_os_301',
    class_code: 'CS301A',
    subject: 'Operating Systems (Tutorial)',
    day_of_week: 'Tuesday',
    day_index: 2,
    start_time: '02:00 PM',
    end_time: '03:00 PM',
    room: 'Tutorial Room 3',
    type: 'Tutorial',
    mentor_name: 'Prof. Rajesh Verma',
  },
  {
    id: 'tt_5',
    class_id: 'class_os_301',
    class_code: 'CS301A',
    subject: 'Operating Systems & Architecture',
    day_of_week: 'Wednesday',
    day_index: 3,
    start_time: '09:30 AM',
    end_time: '10:30 AM',
    room: 'Hall CS-204',
    type: 'Lecture',
    mentor_name: 'Prof. Rajesh Verma',
  },
  {
    id: 'tt_6',
    class_id: 'class_ml_401',
    class_code: 'AI401C',
    subject: 'Machine Learning Foundations',
    day_of_week: 'Wednesday',
    day_index: 3,
    start_time: '11:30 AM',
    end_time: '01:00 PM',
    room: 'Seminar Hall B',
    type: 'Lecture',
    mentor_name: 'Dr. Sunita Rao',
  },
  {
    id: 'tt_7',
    class_id: 'class_dsa_201',
    class_code: 'DS201B',
    subject: 'Data Structures & Algorithms',
    day_of_week: 'Thursday',
    day_index: 4,
    start_time: '10:00 AM',
    end_time: '11:30 AM',
    room: 'Hall CS-101',
    type: 'Lecture',
    mentor_name: 'Prof. Rajesh Verma',
  },
  {
    id: 'tt_8',
    class_id: 'class_os_301',
    class_code: 'CS301A',
    subject: 'OS Kernel & Systems Lab',
    day_of_week: 'Thursday',
    day_index: 4,
    start_time: '02:00 PM',
    end_time: '04:00 PM',
    room: 'Systems Lab 1',
    type: 'Lab',
    mentor_name: 'Prof. Rajesh Verma',
  },
  {
    id: 'tt_9',
    class_id: 'class_os_301',
    class_code: 'CS301A',
    subject: 'Operating Systems & Architecture',
    day_of_week: 'Friday',
    day_index: 5,
    start_time: '09:30 AM',
    end_time: '10:30 AM',
    room: 'Hall CS-204',
    type: 'Lecture',
    mentor_name: 'Prof. Rajesh Verma',
  },
  {
    id: 'tt_10',
    class_id: 'class_dsa_201',
    class_code: 'DS201B',
    subject: 'Data Structures Problem Solving',
    day_of_week: 'Friday',
    day_index: 5,
    start_time: '11:00 AM',
    end_time: '12:30 PM',
    room: 'Hall CS-101',
    type: 'Tutorial',
    mentor_name: 'Prof. Rajesh Verma',
  },
];

export default INITIAL_ATTENDANCE_RECORDS;
