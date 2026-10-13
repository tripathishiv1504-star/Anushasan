/**
 * Seed Study Sessions for Prototype Mock Data
 * Field names strictly follow spec section 10:
 * id, student_id, subject, started_at, duration_minutes, notes
 */

/**
 * Helper to compute ISO timestamp at specific day offset and hour
 * @param {number} daysAgo - 0 is today, 1 is yesterday, etc.
 * @param {number} hour - 24-hr format hour
 * @param {number} minute
 * @returns {string} ISO timestamp
 */
function getDateAgo(daysAgo, hour = 10, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export function generateSeedStudySessions() {
  const sessions = [];

  // ==========================================
  // Student 1 (Class Mode): Aarav Sharma (user_student_1)
  // 4 Weeks of realistic sessions (days 0 to 27)
  // Current 7-day consistency: 7/7 days with >= 30 mins (Active streak: 7 days)
  // ==========================================

  // Week 1 (Days 0 - 6: Today and past 6 days)
  sessions.push(
    {
      id: 'session_s1_w1_d0_1',
      student_id: 'user_student_1',
      subject: 'Operating Systems',
      started_at: getDateAgo(0, 9, 30),
      duration_minutes: 60,
      notes: 'Virtual memory paging and TLB translation algorithms.',
    },
    {
      id: 'session_s1_w1_d0_2',
      student_id: 'user_student_1',
      subject: 'Data Structures',
      started_at: getDateAgo(0, 14, 15),
      duration_minutes: 45,
      notes: 'Binary heap insertion, percolation, and priority queues.',
    },
    {
      id: 'session_s1_w1_d1',
      student_id: 'user_student_1',
      subject: 'Computer Networks',
      started_at: getDateAgo(1, 10, 0),
      duration_minutes: 75,
      notes: 'TCP 3-way handshake and sliding window flow control.',
    },
    {
      id: 'session_s1_w1_d2',
      student_id: 'user_student_1',
      subject: 'Operating Systems',
      started_at: getDateAgo(2, 11, 0),
      duration_minutes: 90,
      notes: 'Process synchronization primitives: Semaphores & Mutex.',
    },
    {
      id: 'session_s1_w1_d3',
      student_id: 'user_student_1',
      subject: 'Database Management',
      started_at: getDateAgo(3, 15, 0),
      duration_minutes: 60,
      notes: 'B+ Tree indexing and SQL execution plans.',
    },
    {
      id: 'session_s1_w1_d4',
      student_id: 'user_student_1',
      subject: 'Data Structures',
      started_at: getDateAgo(4, 16, 30),
      duration_minutes: 45,
      notes: 'Graph adjacency list representation & BFS traversal.',
    },
    {
      id: 'session_s1_w1_d5',
      student_id: 'user_student_1',
      subject: 'Computer Networks',
      started_at: getDateAgo(5, 10, 30),
      duration_minutes: 50,
      notes: 'CIDR subnetting and routing table lookups.',
    },
    {
      id: 'session_s1_w1_d6',
      student_id: 'user_student_1',
      subject: 'Operating Systems',
      started_at: getDateAgo(6, 14, 0),
      duration_minutes: 40,
      notes: 'Deadlock Banker algorithm and safety check simulation.',
    }
  );

  // Week 2 (Days 7 - 13)
  sessions.push(
    {
      id: 'session_s1_w2_d7',
      student_id: 'user_student_1',
      subject: 'Data Structures',
      started_at: getDateAgo(7, 10, 0),
      duration_minutes: 90,
      notes: 'Red-Black Tree balance invariants.',
    },
    {
      id: 'session_s1_w2_d8',
      student_id: 'user_student_1',
      subject: 'Operating Systems',
      started_at: getDateAgo(8, 14, 30),
      duration_minutes: 60,
      notes: 'CPU scheduling: Round Robin vs Multilevel Feedback Queue.',
    },
    {
      id: 'session_s1_w2_d10',
      student_id: 'user_student_1',
      subject: 'Database Management',
      started_at: getDateAgo(10, 11, 0),
      duration_minutes: 80,
      notes: 'Relational algebra and normalization to BCNF.',
    },
    {
      id: 'session_s1_w2_d11',
      student_id: 'user_student_1',
      subject: 'Computer Networks',
      started_at: getDateAgo(11, 15, 0),
      duration_minutes: 55,
      notes: 'OSI 7 layer vs TCP/IP 4 layer architecture.',
    },
    {
      id: 'session_s1_w2_d12',
      student_id: 'user_student_1',
      subject: 'Data Structures',
      started_at: getDateAgo(12, 9, 30),
      duration_minutes: 70,
      notes: 'Hash table collision resolution with Robin Hood hashing.',
    }
  );

  // Week 3 (Days 14 - 20)
  sessions.push(
    {
      id: 'session_s1_w3_d14',
      student_id: 'user_student_1',
      subject: 'Operating Systems',
      started_at: getDateAgo(14, 10, 0),
      duration_minutes: 80,
      notes: 'Threads, concurrency, and race condition debugging.',
    },
    {
      id: 'session_s1_w3_d16',
      student_id: 'user_student_1',
      subject: 'Computer Networks',
      started_at: getDateAgo(16, 14, 0),
      duration_minutes: 65,
      notes: 'DNS hierarchy and resolution workflow.',
    },
    {
      id: 'session_s1_w3_d18',
      student_id: 'user_student_1',
      subject: 'Database Management',
      started_at: getDateAgo(18, 16, 0),
      duration_minutes: 90,
      notes: 'ACID properties and write-ahead logging (WAL).',
    },
    {
      id: 'session_s1_w3_d19',
      student_id: 'user_student_1',
      subject: 'Data Structures',
      started_at: getDateAgo(19, 11, 0),
      duration_minutes: 50,
      notes: 'Disjoint-set union (Union-Find) with path compression.',
    }
  );

  // Week 4 (Days 21 - 27)
  sessions.push(
    {
      id: 'session_s1_w4_d21',
      student_id: 'user_student_1',
      subject: 'Operating Systems',
      started_at: getDateAgo(21, 10, 0),
      duration_minutes: 60,
      notes: 'Kernel space vs user space context switches.',
    },
    {
      id: 'session_s1_w4_d23',
      student_id: 'user_student_1',
      subject: 'Data Structures',
      started_at: getDateAgo(23, 14, 0),
      duration_minutes: 75,
      notes: 'Trie tree prefix matching and autocomplete design.',
    },
    {
      id: 'session_s1_w4_d25',
      student_id: 'user_student_1',
      subject: 'Computer Networks',
      started_at: getDateAgo(25, 15, 30),
      duration_minutes: 45,
      notes: 'HTTP/1.1 vs HTTP/2 multiplexing.',
    },
    {
      id: 'session_s1_w4_d27',
      student_id: 'user_student_1',
      subject: 'Database Management',
      started_at: getDateAgo(27, 9, 0),
      duration_minutes: 60,
      notes: 'SQL transaction isolation levels: Read Committed vs Serializable.',
    }
  );

  // ==========================================
  // Student 2 (Solo Mode): Priya Patel (user_student_solo)
  // 4 Weeks of realistic self-directed study sessions
  // ==========================================

  // Week 1 (Days 0 - 6)
  sessions.push(
    {
      id: 'session_s2_w1_d0',
      student_id: 'user_student_solo',
      subject: 'Web Development',
      started_at: getDateAgo(0, 10, 0),
      duration_minutes: 60,
      notes: 'State management and custom React hooks.',
    },
    {
      id: 'session_s2_w1_d1',
      student_id: 'user_student_solo',
      subject: 'Python',
      started_at: getDateAgo(1, 14, 0),
      duration_minutes: 45,
      notes: 'Python async/await coroutines and event loops.',
    },
    {
      id: 'session_s2_w1_d2',
      student_id: 'user_student_solo',
      subject: 'Algorithms',
      started_at: getDateAgo(2, 11, 0),
      duration_minutes: 80,
      notes: 'Dynamic programming: 0/1 Knapsack & Coin Change.',
    },
    {
      id: 'session_s2_w1_d3',
      student_id: 'user_student_solo',
      subject: 'System Design',
      started_at: getDateAgo(3, 16, 0),
      duration_minutes: 50,
      notes: 'Distributed caching patterns: Cache-Aside vs Write-Through.',
    },
    {
      id: 'session_s2_w1_d4',
      student_id: 'user_student_solo',
      subject: 'Web Development',
      started_at: getDateAgo(4, 9, 0),
      duration_minutes: 45,
      notes: 'CSS Grid and Flexbox responsive layouts.',
    },
    {
      id: 'session_s2_w1_d5',
      student_id: 'user_student_solo',
      subject: 'Algorithms',
      started_at: getDateAgo(5, 15, 0),
      duration_minutes: 60,
      notes: 'Two pointer technique on sorted arrays.',
    }
  );

  // Weeks 2 - 4 for user_student_solo
  sessions.push(
    {
      id: 'session_s2_w2_d8',
      student_id: 'user_student_solo',
      subject: 'Web Development',
      started_at: getDateAgo(8, 10, 0),
      duration_minutes: 90,
      notes: 'Building accessible modal dialogs with keyboard trap.',
    },
    {
      id: 'session_s2_w2_d10',
      student_id: 'user_student_solo',
      subject: 'Python',
      started_at: getDateAgo(10, 14, 0),
      duration_minutes: 60,
      notes: 'Dataclasses and Pydantic schema validation.',
    },
    {
      id: 'session_s2_w2_d12',
      student_id: 'user_student_solo',
      subject: 'System Design',
      started_at: getDateAgo(12, 11, 0),
      duration_minutes: 75,
      notes: 'Rate limiting algorithms: Token bucket & Leaky bucket.',
    },
    {
      id: 'session_s2_w3_d15',
      student_id: 'user_student_solo',
      subject: 'Algorithms',
      started_at: getDateAgo(15, 10, 30),
      duration_minutes: 70,
      notes: 'Binary search variations and bounds checking.',
    },
    {
      id: 'session_s2_w3_d18',
      student_id: 'user_student_solo',
      subject: 'Web Development',
      started_at: getDateAgo(18, 15, 0),
      duration_minutes: 85,
      notes: 'Vite bundling and code-splitting optimizations.',
    },
    {
      id: 'session_s2_w4_d22',
      student_id: 'user_student_solo',
      subject: 'System Design',
      started_at: getDateAgo(22, 10, 0),
      duration_minutes: 60,
      notes: 'Database sharding vs master-replica replication.',
    },
    {
      id: 'session_s2_w4_d26',
      student_id: 'user_student_solo',
      subject: 'Python',
      started_at: getDateAgo(26, 16, 0),
      duration_minutes: 45,
      notes: 'Unit testing with pytest fixtures and mocks.',
    }
  );

  return sessions;
}

export const INITIAL_STUDY_SESSIONS = generateSeedStudySessions();

export default INITIAL_STUDY_SESSIONS;
