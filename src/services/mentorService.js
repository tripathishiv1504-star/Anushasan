/**
 * Mentor Service (Phase 2 - Step 21f)
 * Connects to Supabase public.classes, public.class_members, and telemetry tables,
 * with full fallback to local cache and mock stores for demo accounts.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { storage } from '../utils/storage';
import { INITIAL_CLASSES, INITIAL_CLASS_MEMBERS } from '../mock/classes';
import { INITIAL_CLASS_STUDENTS } from '../mock/classStudents';
import { authService } from './authService';

const CLASSES_STORAGE_KEY = 'campus_classes';
const MEMBERS_STORAGE_KEY = 'class_members';
const USERS_STORAGE_KEY = 'registered_users';
const CLASS_STUDENTS_STORAGE_KEY = 'campus_class_students';
const ALERTS_ACTIONS_STORAGE_KEY = 'mentor_alerts_actions';

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

function getStoredClasses() {
  const classes = storage.get(CLASSES_STORAGE_KEY, null);
  if (!classes || !Array.isArray(classes) || classes.length === 0) {
    storage.set(CLASSES_STORAGE_KEY, INITIAL_CLASSES);
    return INITIAL_CLASSES;
  }
  return classes;
}

function getStoredMembers() {
  const members = storage.get(MEMBERS_STORAGE_KEY, null);
  if (!members || !Array.isArray(members) || members.length <= 1) {
    const seedMembers = INITIAL_CLASS_STUDENTS.map((s) => ({
      id: `member_${s.id}_${s.class_id}`,
      class_id: s.class_id,
      student_id: s.id,
      joined_at: '2026-09-02T10:00:00.000Z',
    }));
    storage.set(MEMBERS_STORAGE_KEY, seedMembers);
    return seedMembers;
  }
  return members;
}

function getStoredStudents() {
  const students = storage.get(CLASS_STUDENTS_STORAGE_KEY, null);
  if (!students || !Array.isArray(students) || students.length === 0) {
    storage.set(CLASS_STUDENTS_STORAGE_KEY, INITIAL_CLASS_STUDENTS);
    return INITIAL_CLASS_STUDENTS;
  }
  return students;
}

function generateRandomCode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateUniqueJoinCode(existingClasses = []) {
  const usedCodes = new Set(
    existingClasses.map((c) => (c.join_code || '').toUpperCase())
  );

  let attempts = 0;
  while (attempts < 1000) {
    const candidate = generateRandomCode();
    if (!usedCodes.has(candidate)) {
      return candidate;
    }
    attempts++;
  }
  return `CS${Date.now().toString(36).toUpperCase().slice(-4)}`;
}

function evaluateRiskStatus(currentScore, previousScore) {
  const isBelowThreshold = currentScore < 50;
  const drop = previousScore !== undefined && previousScore !== null ? previousScore - currentScore : 0;
  const isSevereDrop = drop >= 15;

  const isAtRisk = isBelowThreshold || isSevereDrop;

  let riskReason = null;
  if (isAtRisk) {
    if (isBelowThreshold && isSevereDrop) {
      riskReason = `Score ${currentScore}, down ${drop} points from last week`;
    } else if (isBelowThreshold) {
      riskReason = `Score ${currentScore} (below passing threshold of 50)`;
    } else {
      riskReason = `Score ${currentScore}, dropped ${drop} points compared with previous week`;
    }
  }

  return { isAtRisk, riskReason };
}

export const mentorService = {
  /**
   * Generate a unique 6-character class join code for pre-filling in modal
   * @returns {Promise<string>}
   */
  async generateJoinCode() {
    await delay(50);
    const classes = getStoredClasses();
    return generateUniqueJoinCode(classes);
  },

  /**
   * Get all classes taught by a specific mentor with enrolled student count
   * @param {string} mentorId
   * @returns {Promise<Array<Object>>}
   */
  async getMentorClasses(mentorId) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(mentorId);
    if (isSupabaseConfigured && mentorId && isUuid) {
      try {
        const { data: dbClasses, error: cErr } = await supabase
          .from('classes')
          .select('*')
          .eq('mentor_id', mentorId)
          .order('created_at', { ascending: false });

        if (!cErr && dbClasses && dbClasses.length > 0) {
          const classIds = dbClasses.map((c) => c.id);
          const { data: members } = await supabase
            .from('class_members')
            .select('class_id')
            .in('class_id', classIds);

          const memberCounts = {};
          (members || []).forEach((m) => {
            memberCounts[m.class_id] = (memberCounts[m.class_id] || 0) + 1;
          });

          return dbClasses.map((c) => ({
            ...c,
            student_count: memberCounts[c.id] || 0,
          }));
        }
      } catch (err) {
        console.warn('[mentorService] Supabase getMentorClasses error, using cache:', err.message);
      }
    }

    await delay(150);
    const classes = getStoredClasses();
    const members = getStoredMembers();

    const mentorClasses = classes.filter(
      (c) =>
        c.mentor_id === mentorId ||
        (!c.mentor_id && mentorId === 'user_mentor_1') ||
        (mentorId === 'user_mentor_1' && c.mentor_id === 'user_mentor_1')
    );

    const classesWithCounts = mentorClasses.map((cls) => {
      const studentCount = members.filter((m) => m.class_id === cls.id).length;
      return {
        ...cls,
        student_count: studentCount,
      };
    });

    return classesWithCounts.sort(
      (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
    );
  },

  /**
   * Get a single class by id
   * @param {string} classId
   * @returns {Promise<Object>}
   */
  async getClassById(classId) {
    if (isSupabaseConfigured && classId) {
      try {
        const { data: cls, error } = await supabase
          .from('classes')
          .select('*')
          .eq('id', classId)
          .maybeSingle();

        if (!error && cls) {
          const { count } = await supabase
            .from('class_members')
            .select('*', { count: 'exact', head: true })
            .eq('class_id', classId);

          return {
            ...cls,
            student_count: count || 0,
          };
        }
      } catch (err) {
        console.warn('[mentorService] Supabase getClassById error, using cache:', err.message);
      }
    }

    await delay(120);
    const classes = getStoredClasses();
    const members = getStoredMembers();

    const matched = classes.find((c) => c.id === classId);
    if (!matched) {
      throw new Error(`Class with ID "${classId}" not found.`);
    }

    const studentCount = members.filter((m) => m.class_id === classId).length;
    return {
      ...matched,
      student_count: studentCount,
    };
  },

  /**
   * Create a new class
   */
  async createClass({ mentorId, mentorName, name, subject, departmentId, customCode }) {
    const cleanName = (name || '').trim();
    const cleanSubject = (subject || '').trim();

    if (!cleanName || cleanName.length < 3) {
      throw new Error('Class name must be at least 3 characters long.');
    }
    if (!cleanSubject) {
      throw new Error('Please select or specify a subject/domain.');
    }

    const classes = getStoredClasses();

    let code = (customCode || '').trim().toUpperCase();
    if (!code || code.length !== 6) {
      code = generateUniqueJoinCode(classes);
    } else {
      const exists = classes.some((c) => (c.join_code || '').toUpperCase() === code);
      if (exists) {
        code = generateUniqueJoinCode(classes);
      }
    }

    if (isSupabaseConfigured && mentorId) {
      try {
        const { data, error } = await supabase
          .from('classes')
          .insert({
            name: cleanName,
            subject: cleanSubject,
            mentor_id: mentorId,
            department_id: departmentId || null,
            join_code: code,
          })
          .select('*')
          .single();

        if (!error && data) {
          const enriched = {
            ...data,
            mentor_name: mentorName || 'Faculty Mentor',
            student_count: 0,
          };
          storage.set(CLASSES_STORAGE_KEY, [enriched, ...classes]);
          return enriched;
        }
      } catch (err) {
        console.warn('[mentorService] Supabase createClass error, using cache:', err.message);
      }
    }

    await delay(180);

    const newClass = {
      id: `class_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: cleanName,
      subject: cleanSubject,
      mentor_id: mentorId,
      mentor_name: mentorName || 'Faculty Mentor',
      department_id: departmentId || 'dept_cs',
      join_code: code,
      created_at: new Date().toISOString(),
    };

    const updatedClasses = [newClass, ...classes];
    storage.set(CLASSES_STORAGE_KEY, updatedClasses);

    return {
      ...newClass,
      student_count: 0,
    };
  },

  /**
   * Update or rename an existing class
   */
  async updateClass(classId, { name, subject }) {
    const cleanName = (name || '').trim();
    const cleanSubject = (subject || '').trim();

    if (!cleanName || cleanName.length < 3) {
      throw new Error('Class name must be at least 3 characters long.');
    }

    if (isSupabaseConfigured && classId) {
      try {
        await supabase
          .from('classes')
          .update({
            name: cleanName,
            subject: cleanSubject || undefined,
          })
          .eq('id', classId);
      } catch (err) {
        console.warn('[mentorService] Supabase updateClass error:', err.message);
      }
    }

    await delay(150);
    const classes = getStoredClasses();
    const classIndex = classes.findIndex((c) => c.id === classId);

    if (classIndex === -1) {
      throw new Error('Class not found.');
    }

    const updated = {
      ...classes[classIndex],
      name: cleanName,
      subject: cleanSubject || classes[classIndex].subject,
      updated_at: new Date().toISOString(),
    };

    classes[classIndex] = updated;
    storage.set(CLASSES_STORAGE_KEY, classes);

    const members = getStoredMembers();
    const studentCount = members.filter((m) => m.class_id === classId).length;

    return {
      ...updated,
      student_count: studentCount,
    };
  },

  /**
   * Delete a class and remove student enrollment memberships
   */
  async deleteClass(classId) {
    if (isSupabaseConfigured && classId) {
      try {
        await supabase.from('classes').delete().eq('id', classId);
      } catch (err) {
        console.warn('[mentorService] Supabase deleteClass error:', err.message);
      }
    }

    await delay(180);
    const classes = getStoredClasses();
    const filteredClasses = classes.filter((c) => c.id !== classId);
    storage.set(CLASSES_STORAGE_KEY, filteredClasses);

    const members = getStoredMembers();
    const filteredMembers = members.filter((m) => m.class_id !== classId);
    storage.set(MEMBERS_STORAGE_KEY, filteredMembers);

    return { success: true };
  },

  /**
   * Get students enrolled in a specific class with risk status evaluated
   * @param {string} classId
   * @returns {Promise<Array<Object>>}
   */
  async getClassStudents(classId) {
    await delay(150);
    const allStudents = getStoredStudents();
    const classStudents = allStudents.filter((s) => s.class_id === classId);

    return classStudents.map((s) => {
      const { isAtRisk, riskReason } = evaluateRiskStatus(
        s.current_score,
        s.previous_score
      );
      return {
        ...s,
        is_at_risk: isAtRisk,
        risk_reason: riskReason,
      };
    });
  },

  /**
   * Get class overview with summary statistics, score distribution, and student roster
   * @param {string} classId
   * @returns {Promise<Object>}
   */
  async getClassOverview(classId) {
    const classInfo = await this.getClassById(classId);
    const students = await this.getClassStudents(classId);

    const totalStudents = students.length;

    const averageScore =
      totalStudents > 0
        ? Math.round(
            students.reduce((acc, s) => acc + (s.current_score || 0), 0) /
              totalStudents
          )
        : 0;

    const studentsAtRisk = students.filter((s) => s.is_at_risk).length;

    const averageAttendance =
      totalStudents > 0
        ? Math.round(
            students.reduce((acc, s) => acc + (s.attendance_pct || 0), 0) /
              totalStudents
          )
        : 0;

    const goalsOnTrackCount = students.filter((s) => s.goals_on_track).length;
    const goalsOnTrackPct =
      totalStudents > 0
        ? Math.round((goalsOnTrackCount / totalStudents) * 100)
        : 0;

    const bandUnder50 = students.filter((s) => s.current_score < 50).length;
    const band50to69 = students.filter(
      (s) => s.current_score >= 50 && s.current_score < 70
    ).length;
    const band70to84 = students.filter(
      (s) => s.current_score >= 70 && s.current_score < 85
    ).length;
    const band85plus = students.filter((s) => s.current_score >= 85).length;

    const scoreDistribution = [
      { range: '< 50', count: bandUnder50, label: 'At Risk (< 50)', fill: '#DC2626' },
      { range: '50 - 69', count: band50to69, label: 'Passing (50-69)', fill: '#F59E0B' },
      { range: '70 - 84', count: band70to84, label: 'Good (70-84)', fill: '#0F766E' },
      { range: '85 - 100', count: band85plus, label: 'Excellent (85-100)', fill: '#16A34A' },
    ];

    return {
      classInfo,
      students,
      stats: {
        averageScore,
        studentsAtRisk,
        averageAttendance,
        goalsOnTrackCount,
        goalsOnTrackPct,
        totalStudents,
      },
      scoreDistribution,
    };
  },

  /**
   * Get detailed student telemetry for side drawer
   * @param {string} studentId
   * @returns {Promise<Object>}
   */
  async getStudentDetail(studentId) {
    await delay(120);
    const allStudents = getStoredStudents();
    const student = allStudents.find((s) => s.id === studentId);

    if (!student) {
      throw new Error(`Student record not found.`);
    }

    const { isAtRisk, riskReason } = evaluateRiskStatus(
      student.current_score,
      student.previous_score
    );

    return {
      ...student,
      is_at_risk: isAtRisk,
      risk_reason: riskReason,
    };
  },

  /**
   * Get all at-risk students across all classes owned by this mentor
   * @param {string} mentorId
   * @returns {Promise<Array<Object>>}
   */
  async getMentorAlerts(mentorId) {
    const mentorClasses = await this.getMentorClasses(mentorId);
    const mentorClassIds = new Set(mentorClasses.map((c) => c.id));

    const allStudents = getStoredStudents();
    const actionsMap = storage.get(ALERTS_ACTIONS_STORAGE_KEY, {});

    const alerts = [];
    allStudents.forEach((s) => {
      if (mentorClassIds.has(s.class_id)) {
        const { isAtRisk, riskReason } = evaluateRiskStatus(
          s.current_score,
          s.previous_score
        );

        if (isAtRisk) {
          const alertId = `alert_${s.id}_${s.class_id}`;
          const action = actionsMap[alertId] || {};

          alerts.push({
            id: alertId,
            student_id: s.id,
            student_name: s.name,
            student_email: s.email,
            class_id: s.class_id,
            class_name: s.class_name,
            current_score: s.current_score,
            previous_score: s.previous_score,
            score_drop: s.previous_score - s.current_score,
            attendance_pct: s.attendance_pct,
            study_hours_week: s.study_hours_week,
            streak: s.streak,
            reason: riskReason,
            status: action.status || 'active',
            contacted_at: action.contacted_at || null,
            dismissed_at: action.dismissed_at || null,
          });
        }
      }
    });

    return alerts;
  },

  /**
   * Mark an at-risk alert as contacted
   * @param {string} alertId
   * @returns {Promise<{ success: boolean }>}
   */
  async markAlertContacted(alertId) {
    await delay(120);
    const actionsMap = storage.get(ALERTS_ACTIONS_STORAGE_KEY, {});
    actionsMap[alertId] = {
      ...(actionsMap[alertId] || {}),
      status: 'contacted',
      contacted_at: new Date().toISOString(),
    };
    storage.set(ALERTS_ACTIONS_STORAGE_KEY, actionsMap);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('anushasan:alerts_updated'));
    }

    return { success: true };
  },

  /**
   * Dismiss an at-risk alert
   * @param {string} alertId
   * @returns {Promise<{ success: boolean }>}
   */
  async dismissAlert(alertId) {
    await delay(120);
    const actionsMap = storage.get(ALERTS_ACTIONS_STORAGE_KEY, {});
    actionsMap[alertId] = {
      ...(actionsMap[alertId] || {}),
      status: 'dismissed',
      dismissed_at: new Date().toISOString(),
    };
    storage.set(ALERTS_ACTIONS_STORAGE_KEY, actionsMap);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('anushasan:alerts_updated'));
    }

    return { success: true };
  },

  /**
   * Count of active alerts for mentor
   * @param {string} mentorId
   * @returns {Promise<number>}
   */
  async getActiveAlertsCount(mentorId) {
    const alerts = await this.getMentorAlerts(mentorId);
    return alerts.filter((a) => a.status === 'active').length;
  },

  /**
   * Summary stats for mentor profile / cards
   */
  async getMentorSummary(mentorId) {
    const classes = await this.getMentorClasses(mentorId);
    const totalClasses = classes.length;
    const totalStudents = classes.reduce((sum, c) => sum + (c.student_count || 0), 0);

    return {
      totalClasses,
      totalStudents,
    };
  },

  /**
   * Update mentor profile details
   */
  async updateMentorProfile({ mentorId, fullName, departmentId }) {
    if (!fullName || fullName.trim().length < 2) {
      throw new Error('Full name must be at least 2 characters long.');
    }

    const { user: updatedUser } = await authService.updateProfile({
      full_name: fullName.trim(),
      department_id: departmentId || 'dept_cs',
    });

    const classes = getStoredClasses();
    let updatedAny = false;
    const updatedClasses = classes.map((c) => {
      if (c.mentor_id === mentorId) {
        updatedAny = true;
        return { ...c, mentor_name: fullName.trim() };
      }
      return c;
    });

    if (updatedAny) {
      storage.set(CLASSES_STORAGE_KEY, updatedClasses);
    }

    return { user: updatedUser };
  },

  /**
   * Change mentor password
   */
  async changePassword(mentorId, { currentPassword, newPassword }) {
    if (!currentPassword) {
      throw new Error('Current password is required.');
    }
    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long.');
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (!error) return { success: true };
      } catch (err) {
        console.warn('[mentorService] Supabase changePassword error, fallback to cache:', err.message);
      }
    }

    await delay(150);
    const users = storage.get(USERS_STORAGE_KEY, []);
    const userIndex = users.findIndex((u) => u.id === mentorId);

    if (userIndex >= 0) {
      const user = users[userIndex];
      if (user.password && user.password !== currentPassword) {
        throw new Error('Current password does not match.');
      }
      users[userIndex] = { ...user, password: newPassword };
      storage.set(USERS_STORAGE_KEY, users);
    }

    return { success: true };
  },
};

export default mentorService;
