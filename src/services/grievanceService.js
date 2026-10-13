/**
 * Grievance Service (Phase 2 - Step 21f)
 * Connects to Supabase public.grievances table,
 * with full fallback to local cache and mock stores for demo accounts.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { storage } from '../utils/storage';
import { INITIAL_GRIEVANCES } from '../mock/grievances';
import { INITIAL_CLASSES } from '../mock/classes';

const GRIEVANCES_STORAGE_KEY = 'campus_grievances';
const CLASSES_STORAGE_KEY = 'campus_classes';

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

function getStoredGrievances() {
  const grievances = storage.get(GRIEVANCES_STORAGE_KEY, null);
  if (!grievances || !Array.isArray(grievances) || grievances.length === 0) {
    storage.set(GRIEVANCES_STORAGE_KEY, INITIAL_GRIEVANCES);
    return INITIAL_GRIEVANCES;
  }
  return grievances;
}

function getStoredClasses() {
  const classes = storage.get(CLASSES_STORAGE_KEY, null);
  if (!classes || !Array.isArray(classes) || classes.length === 0) {
    return INITIAL_CLASSES;
  }
  return classes;
}

function resolveClassMeta(classId) {
  const classes = getStoredClasses();
  const matched = classes.find(
    (c) =>
      c.id === classId ||
      (classId === 'class_cs301' && c.id === 'class_os_301') ||
      (classId === 'class_ds201' && c.id === 'class_dsa_201')
  );

  if (matched) {
    return {
      id: matched.id,
      name: matched.name,
      code: matched.join_code,
      subject: matched.subject,
    };
  }

  if (classId === 'class_os_301' || classId === 'class_cs301') {
    return {
      id: 'class_os_301',
      name: 'Operating Systems & Architecture',
      code: 'CS301A',
      subject: 'Computer Science',
    };
  }
  if (classId === 'class_dsa_201' || classId === 'class_ds201') {
    return {
      id: 'class_dsa_201',
      name: 'Data Structures & Algorithms',
      code: 'DS201B',
      subject: 'Computer Science',
    };
  }
  if (classId === 'class_ml_401') {
    return {
      id: 'class_ml_401',
      name: 'Machine Learning Foundations',
      code: 'AI401C',
      subject: 'Artificial Intelligence',
    };
  }

  return {
    id: classId || 'class_general',
    name: 'General Campus Academic',
    code: 'GEN101',
    subject: 'General Academic',
  };
}

export const grievanceService = {
  /**
   * Get student's grievances with optional status filter
   *
   * @param {string} studentId
   * @param {'all' | 'open' | 'in_review' | 'resolved' | 'escalated'} [statusFilter='all']
   * @returns {Promise<Array<Object>>}
   */
  async getStudentGrievances(studentId, statusFilter = 'all') {
    const effectiveStudentId = studentId || 'user_student_1';

    if (isSupabaseConfigured && studentId) {
      try {
        let query = supabase
          .from('grievances')
          .select('*')
          .eq('student_id', studentId)
          .order('created_at', { ascending: false });

        if (statusFilter && statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map((g) => {
            const meta = resolveClassMeta(g.class_id);
            return {
              ...g,
              class_name: g.class_name || meta.name,
              class_code: g.class_code || meta.code,
            };
          });
        }
      } catch (err) {
        console.warn('[grievanceService] Supabase getStudentGrievances error, using cache:', err.message);
      }
    }

    await delay(150);
    const all = getStoredGrievances();

    let studentGrievances = all.filter(
      (g) => g.student_id === effectiveStudentId || g.student_id === 'user_student_1'
    );

    if (statusFilter && statusFilter !== 'all') {
      studentGrievances = studentGrievances.filter((g) => g.status === statusFilter);
    }

    return studentGrievances
      .map((g) => {
        const meta = resolveClassMeta(g.class_id);
        return {
          ...g,
          class_name: g.class_name || meta.name,
          class_code: g.class_code || meta.code,
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  /**
   * Get a single grievance by ID
   *
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async getGrievanceById(id) {
    if (isSupabaseConfigured && id) {
      try {
        const { data, error } = await supabase
          .from('grievances')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          const meta = resolveClassMeta(data.class_id);
          return {
            ...data,
            class_name: data.class_name || meta.name,
            class_code: data.class_code || meta.code,
          };
        }
      } catch (err) {
        console.warn('[grievanceService] Supabase getGrievanceById error, using cache:', err.message);
      }
    }

    await delay(120);
    const all = getStoredGrievances();
    const found = all.find((g) => g.id === id);
    if (!found) {
      throw new Error(`Grievance with ID "${id}" was not found.`);
    }
    const meta = resolveClassMeta(found.class_id);
    return {
      ...found,
      class_name: found.class_name || meta.name,
      class_code: found.class_code || meta.code,
    };
  },

  /**
   * Submit a new student grievance
   *
   * @param {Object} params
   * @param {string} params.studentId
   * @param {string} [params.studentName]
   * @param {string} params.classId
   * @param {string} params.category
   * @param {string} params.title
   * @param {string} params.description
   * @returns {Promise<Object>}
   */
  async createGrievance({
    studentId,
    studentName = 'Student',
    classId,
    category,
    title,
    description,
  }) {
    if (!classId) {
      throw new Error('Please select the relevant enrolled class or course.');
    }
    if (!category) {
      throw new Error('Please select a grievance category.');
    }
    if (!title || title.trim().length < 5) {
      throw new Error('Title must be at least 5 characters long.');
    }
    if (!description || description.trim().length < 10) {
      throw new Error('Description must be at least 10 characters long.');
    }

    const meta = resolveClassMeta(classId);
    const timestamp = new Date().toISOString();

    const initialHistory = [
      {
        status: 'open',
        timestamp,
        updated_by: studentName,
        note: 'Grievance submitted by student',
      },
    ];

    if (isSupabaseConfigured && studentId) {
      try {
        const { data, error } = await supabase
          .from('grievances')
          .insert({
            student_id: studentId,
            class_id: classId,
            category: category.trim(),
            title: title.trim(),
            description: description.trim(),
            status: 'open',
            status_history: initialHistory,
          })
          .select('*')
          .single();

        if (!error && data) {
          const enriched = {
            ...data,
            student_name: studentName,
            class_code: meta.code,
            class_name: meta.name,
          };
          const current = getStoredGrievances();
          storage.set(GRIEVANCES_STORAGE_KEY, [enriched, ...current]);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('anushasan:grievance_updated', { detail: enriched })
            );
          }
          return enriched;
        }
      } catch (err) {
        console.warn('[grievanceService] Supabase createGrievance error, using cache:', err.message);
      }
    }

    await delay(180);
    const current = getStoredGrievances();

    const newGrievance = {
      id: `grv_${Date.now()}`,
      student_id: studentId || 'user_student_1',
      student_name: studentName,
      class_id: classId,
      class_code: meta.code,
      class_name: meta.name,
      category: category.trim(),
      title: title.trim(),
      description: description.trim(),
      status: 'open',
      created_at: timestamp,
      mentor_reply: null,
      replied_at: null,
      resolved_by: null,
      status_history: initialHistory,
    };

    const updated = [newGrievance, ...current];
    storage.set(GRIEVANCES_STORAGE_KEY, updated);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('anushasan:grievance_updated', { detail: newGrievance })
      );
    }

    return newGrievance;
  },

  /**
   * Get all grievances filed under classes taught by a specific mentor
   *
   * @param {string} mentorId
   * @param {Object} [options]
   * @param {'all' | 'open' | 'in_review' | 'resolved' | 'escalated'} [options.status='all']
   * @param {string} [options.classId='all']
   * @param {string} [options.searchQuery='']
   * @returns {Promise<Array<Object>>}
   */
  async getMentorGrievances(
    mentorId,
    { status = 'all', classId = 'all', searchQuery = '' } = {}
  ) {
    await delay(150);
    const all = getStoredGrievances();
    const classes = getStoredClasses();

    // Identify classes owned by this mentor
    const mentorClasses = classes.filter(
      (c) => c.mentor_id === mentorId || (!c.mentor_id && mentorId === 'user_mentor_1')
    );
    const mentorClassIds = new Set(mentorClasses.map((c) => c.id));

    if (mentorId === 'user_mentor_1') {
      mentorClassIds.add('class_os_301');
      mentorClassIds.add('class_dsa_201');
      mentorClassIds.add('class_cs301');
      mentorClassIds.add('class_ds201');
    }

    let mentorGrievances = all.filter((g) => {
      const meta = resolveClassMeta(g.class_id);
      return mentorClassIds.has(g.class_id) || mentorClassIds.has(meta.id);
    });

    if (classId && classId !== 'all') {
      mentorGrievances = mentorGrievances.filter((g) => {
        const meta = resolveClassMeta(g.class_id);
        return g.class_id === classId || meta.id === classId || meta.code === classId;
      });
    }

    if (status && status !== 'all') {
      mentorGrievances = mentorGrievances.filter((g) => g.status === status);
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      mentorGrievances = mentorGrievances.filter(
        (g) =>
          (g.title || '').toLowerCase().includes(q) ||
          (g.description || '').toLowerCase().includes(q) ||
          (g.student_name || '').toLowerCase().includes(q) ||
          (g.category || '').toLowerCase().includes(q)
      );
    }

    return mentorGrievances
      .map((g) => {
        const meta = resolveClassMeta(g.class_id);
        const history = g.status_history || [
          {
            status: 'open',
            timestamp: g.created_at,
            updated_by: g.student_name || 'Student',
            note: 'Grievance submitted by student',
          },
          ...(g.replied_at
            ? [
                {
                  status: g.status,
                  timestamp: g.replied_at,
                  updated_by: g.resolved_by || 'Mentor',
                  note: g.mentor_reply
                    ? `Mentor response: "${g.mentor_reply.slice(0, 50)}..."`
                    : 'Mentor response provided',
                },
              ]
            : []),
        ];

        return {
          ...g,
          class_name: g.class_name || meta.name,
          class_code: g.class_code || meta.code,
          status_history: history,
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  /**
   * Get grievance statistics across all classes for a mentor
   *
   * @param {string} mentorId
   * @returns {Promise<Object>}
   */
  async getMentorGrievanceStats(mentorId) {
    const all = await this.getMentorGrievances(mentorId, {
      status: 'all',
      classId: 'all',
      searchQuery: '',
    });

    return {
      total: all.length,
      open: all.filter((g) => g.status === 'open').length,
      in_review: all.filter((g) => g.status === 'in_review').length,
      resolved: all.filter((g) => g.status === 'resolved').length,
      escalated: all.filter((g) => g.status === 'escalated').length,
    };
  },

  /**
   * Update grievance status and reply
   *
   * @param {string} id
   * @param {'open' | 'in_review' | 'resolved' | 'escalated'} newStatus
   * @param {Object} [options]
   * @param {string | null} [options.reply=null]
   * @param {string | null} [options.resolvedBy=null]
   * @param {string | null} [options.note='']
   * @returns {Promise<Object>}
   */
  async updateGrievanceStatus(
    id,
    newStatus,
    { reply = null, resolvedBy = null, note = '' } = {}
  ) {
    const current = getStoredGrievances();
    const index = current.findIndex((g) => g.id === id);

    if (index === -1) {
      throw new Error(`Grievance "${id}" not found.`);
    }

    const existing = current[index];
    const timestamp = new Date().toISOString();

    const previousHistory = existing.status_history || [
      {
        status: 'open',
        timestamp: existing.created_at,
        updated_by: existing.student_name || 'Student',
        note: 'Grievance submitted by student',
      },
    ];

    let actionNote = note;
    if (!actionNote) {
      if (newStatus === 'in_review') actionNote = 'Moved to In Review by mentor';
      else if (newStatus === 'resolved') actionNote = 'Marked as Resolved';
      else if (newStatus === 'escalated') actionNote = 'Escalated to Department Administration';
      else if (reply) actionNote = 'Mentor reply posted';
      else actionNote = `Status changed to ${newStatus}`;
    }

    const updatedHistory = [
      ...previousHistory,
      {
        status: newStatus,
        timestamp,
        updated_by: resolvedBy || 'Prof. Rajesh Verma',
        note: actionNote,
      },
    ];

    if (isSupabaseConfigured && id) {
      try {
        await supabase
          .from('grievances')
          .update({
            status: newStatus,
            mentor_reply: reply !== null ? reply : existing.mentor_reply,
            mentor_reply_at: reply ? timestamp : existing.mentor_reply_at,
            resolved_at: newStatus === 'resolved' ? timestamp : existing.resolved_at,
            status_history: updatedHistory,
            updated_at: timestamp,
          })
          .eq('id', id);
      } catch (err) {
        console.warn('[grievanceService] Supabase updateGrievanceStatus error, using cache:', err.message);
      }
    }

    await delay(150);

    const updatedRecord = {
      ...existing,
      status: newStatus,
      mentor_reply: reply !== null ? reply : existing.mentor_reply,
      replied_at: reply ? timestamp : existing.replied_at,
      resolved_by:
        resolvedBy !== null
          ? resolvedBy
          : newStatus === 'resolved'
          ? resolvedBy || 'Prof. Rajesh Verma'
          : existing.resolved_by,
      status_history: updatedHistory,
    };

    const updated = [...current];
    updated[index] = updatedRecord;
    storage.set(GRIEVANCES_STORAGE_KEY, updated);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('anushasan:grievance_updated', { detail: updatedRecord })
      );
    }

    return updatedRecord;
  },

  /**
   * Post a mentor reply to a grievance
   *
   * @param {string} id
   * @param {string} replyText
   * @param {string} [mentorName='Prof. Rajesh Verma']
   * @param {boolean} [markResolved=false]
   * @returns {Promise<Object>}
   */
  async addReply(id, replyText, mentorName = 'Prof. Rajesh Verma', markResolved = false) {
    if (!replyText || !replyText.trim()) {
      throw new Error('Please write a reply message for the student.');
    }

    const current = await this.getGrievanceById(id);
    const targetStatus = markResolved
      ? 'resolved'
      : current.status === 'open'
      ? 'in_review'
      : current.status;

    return this.updateGrievanceStatus(id, targetStatus, {
      reply: replyText.trim(),
      resolvedBy: mentorName,
      note: markResolved ? 'Replied and marked resolved' : 'Mentor reply posted',
    });
  },

  /**
   * Escalate grievance to college administration
   *
   * @param {string} id
   * @param {string} [reason='']
   * @param {string} [mentorName='Prof. Rajesh Verma']
   * @returns {Promise<Object>}
   */
  async escalateGrievance(id, reason = '', mentorName = 'Prof. Rajesh Verma') {
    const note = reason && reason.trim()
      ? `Escalated to admin: ${reason.trim()}`
      : 'Escalated to Department Administration';

    return this.updateGrievanceStatus(id, 'escalated', {
      resolvedBy: mentorName,
      note,
    });
  },

  /**
   * Get grievance count statistics for a student
   *
   * @param {string} studentId
   * @returns {Promise<Object>}
   */
  async getGrievanceStats(studentId) {
    const grievances = await this.getStudentGrievances(studentId, 'all');

    return {
      total: grievances.length,
      open: grievances.filter((g) => g.status === 'open').length,
      in_review: grievances.filter((g) => g.status === 'in_review').length,
      resolved: grievances.filter((g) => g.status === 'resolved').length,
      escalated: grievances.filter((g) => g.status === 'escalated').length,
    };
  },
};

export default grievanceService;
