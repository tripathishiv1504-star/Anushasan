/**
 * Seed Tasks for Prototype Mock Data
 * Field names strictly follow spec section 10:
 * id, student_id, title, subject, due_date, is_done
 */

/**
 * Format date offset in YYYY-MM-DD
 * @param {number} daysOffset - 0 is today, -1 is yesterday, 1 is tomorrow
 * @returns {string} YYYY-MM-DD
 */
function getDueDateFormat(daysOffset) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateSeedTasks() {
  const tasks = [];

  // ==========================================
  // Student 1 (Class Mode): Aarav Sharma (user_student_1)
  // Tasks for Today (Day 0)
  // ==========================================
  tasks.push(
    {
      id: 'task_s1_01',
      student_id: 'user_student_1',
      title: 'Complete OS Memory Management Lab 3',
      subject: 'Operating Systems',
      due_date: getDueDateFormat(0),
      is_done: true,
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'task_s1_02',
      student_id: 'user_student_1',
      title: 'Implement AVL Tree self-balancing in C++',
      subject: 'Data Structures',
      due_date: getDueDateFormat(0),
      is_done: false,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'task_s1_03',
      student_id: 'user_student_1',
      title: 'Review TCP/IP 3-way handshake diagrams',
      subject: 'Computer Networks',
      due_date: getDueDateFormat(0),
      is_done: true,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'task_s1_04',
      student_id: 'user_student_1',
      title: 'Prepare SQL indexing queries for quiz',
      subject: 'Database Management',
      due_date: getDueDateFormat(0),
      is_done: false,
      created_at: new Date().toISOString(),
    }
  );

  // Upcoming Tasks for Student 1
  tasks.push(
    {
      id: 'task_s1_up_01',
      student_id: 'user_student_1',
      title: 'Submit Lab Report on Process Scheduling',
      subject: 'Operating Systems',
      due_date: getDueDateFormat(1),
      is_done: false,
      created_at: new Date().toISOString(),
    },
    {
      id: 'task_s1_up_02',
      student_id: 'user_student_1',
      title: 'Solve LeetCode Top 5 Graph BFS problems',
      subject: 'Data Structures',
      due_date: getDueDateFormat(3),
      is_done: false,
      created_at: new Date().toISOString(),
    },
    {
      id: 'task_s1_up_03',
      student_id: 'user_student_1',
      title: 'Draft Grievance Report for lab AC maintenance',
      subject: 'General Campus',
      due_date: getDueDateFormat(5),
      is_done: false,
      created_at: new Date().toISOString(),
    }
  );

  // Completed Past Tasks (Weeks 1 - 4) for Student 1
  tasks.push(
    {
      id: 'task_s1_past_01',
      student_id: 'user_student_1',
      title: 'Read Operating Systems Chapters 1-4',
      subject: 'Operating Systems',
      due_date: getDueDateFormat(-2),
      is_done: true,
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: 'task_s1_past_02',
      student_id: 'user_student_1',
      title: 'Submit Assignment 1: Linked Lists vs Arrays',
      subject: 'Data Structures',
      due_date: getDueDateFormat(-4),
      is_done: true,
      created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
    {
      id: 'task_s1_past_03',
      student_id: 'user_student_1',
      title: 'Configure Wireshark packet capture trace',
      subject: 'Computer Networks',
      due_date: getDueDateFormat(-8),
      is_done: true,
      created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    },
    {
      id: 'task_s1_past_04',
      student_id: 'user_student_1',
      title: 'Normalize Bookstore schema to 3NF',
      subject: 'Database Management',
      due_date: getDueDateFormat(-12),
      is_done: true,
      created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
    },
    {
      id: 'task_s1_past_05',
      student_id: 'user_student_1',
      title: 'Midterm Revision: Sorting Algorithms',
      subject: 'Data Structures',
      due_date: getDueDateFormat(-16),
      is_done: true,
      created_at: new Date(Date.now() - 86400000 * 18).toISOString(),
    },
    {
      id: 'task_s1_past_06',
      student_id: 'user_student_1',
      title: 'Submit Semaphore Producer-Consumer demo',
      subject: 'Operating Systems',
      due_date: getDueDateFormat(-22),
      is_done: true,
      created_at: new Date(Date.now() - 86400000 * 25).toISOString(),
    }
  );

  // ==========================================
  // Student 2 (Solo Mode): Priya Patel (user_student_solo)
  // Tasks for Today (Day 0)
  // ==========================================
  tasks.push(
    {
      id: 'task_s2_01',
      student_id: 'user_student_solo',
      title: 'Build React custom hook for localStorage sync',
      subject: 'Web Development',
      due_date: getDueDateFormat(0),
      is_done: true,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'task_s2_02',
      student_id: 'user_student_solo',
      title: 'Solve 3 Dynamic Programming problems on LeetCode',
      subject: 'Algorithms',
      due_date: getDueDateFormat(0),
      is_done: false,
      created_at: new Date().toISOString(),
    },
    {
      id: 'task_s2_03',
      student_id: 'user_student_solo',
      title: 'Read System Design chapter on Distributed Caching',
      subject: 'System Design',
      due_date: getDueDateFormat(0),
      is_done: false,
      created_at: new Date().toISOString(),
    }
  );

  // Upcoming & Past Tasks for Student 2
  tasks.push(
    {
      id: 'task_s2_up_01',
      student_id: 'user_student_solo',
      title: 'Refactor portfolio site with responsive CSS Grid',
      subject: 'Web Development',
      due_date: getDueDateFormat(2),
      is_done: false,
      created_at: new Date().toISOString(),
    },
    {
      id: 'task_s2_past_01',
      student_id: 'user_student_solo',
      title: 'Implement Python Trie for Autocomplete',
      subject: 'Python',
      due_date: getDueDateFormat(-3),
      is_done: true,
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: 'task_s2_past_02',
      student_id: 'user_student_solo',
      title: 'Study SQL vs NoSQL trade-offs for chat app',
      subject: 'System Design',
      due_date: getDueDateFormat(-9),
      is_done: true,
      created_at: new Date(Date.now() - 86400000 * 11).toISOString(),
    },
    {
      id: 'task_s2_past_03',
      student_id: 'user_student_solo',
      title: 'Complete 7-day JavaScript 30 challenge',
      subject: 'Web Development',
      due_date: getDueDateFormat(-17),
      is_done: true,
      created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
    }
  );

  return tasks;
}

export const INITIAL_TASKS = generateSeedTasks();

export default INITIAL_TASKS;
