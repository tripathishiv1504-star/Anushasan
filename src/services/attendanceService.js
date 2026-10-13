/**
 * Attendance Service (Phase 2 - Step 21f)
 * Connects to Supabase public.attendance_records table,
 * with full fallback to local cache and mock stores for demo accounts.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { storage } from '../utils/storage';
import { INITIAL_ATTENDANCE_RECORDS, INITIAL_TIMETABLE } from '../mock/attendance';
import { INITIAL_CLASSES } from '../mock/classes';

const ATTENDANCE_STORAGE_KEY = 'attendance_records';
const TIMETABLE_STORAGE_KEY = 'campus_timetable';
const CLASSES_STORAGE_KEY = 'campus_classes';

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

function getStoredAttendance() {
  const records = storage.get(ATTENDANCE_STORAGE_KEY, null);
  if (!records || !Array.isArray(records) || records.length === 0) {
    storage.set(ATTENDANCE_STORAGE_KEY, INITIAL_ATTENDANCE_RECORDS);
    return INITIAL_ATTENDANCE_RECORDS;
  }
  return records;
}

function getStoredTimetable() {
  const timetable = storage.get(TIMETABLE_STORAGE_KEY, null);
  if (!timetable || !Array.isArray(timetable) || timetable.length === 0) {
    storage.set(TIMETABLE_STORAGE_KEY, INITIAL_TIMETABLE);
    return INITIAL_TIMETABLE;
  }
  return timetable;
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
      mentorName: matched.mentor_name || 'Prof. Rajesh Verma',
    };
  }

  if (classId === 'class_os_301' || classId === 'class_cs301') {
    return {
      id: 'class_os_301',
      name: 'Operating Systems & Architecture',
      code: 'CS301A',
      subject: 'Computer Science',
      mentorName: 'Prof. Rajesh Verma',
    };
  }
  if (classId === 'class_dsa_201' || classId === 'class_ds201') {
    return {
      id: 'class_dsa_201',
      name: 'Data Structures & Algorithms',
      code: 'DS201B',
      subject: 'Computer Science',
      mentorName: 'Prof. Rajesh Verma',
    };
  }
  if (classId === 'class_ml_401') {
    return {
      id: 'class_ml_401',
      name: 'Machine Learning Foundations',
      code: 'AI401C',
      subject: 'Artificial Intelligence',
      mentorName: 'Dr. Sunita Rao',
    };
  }

  return {
    id: classId,
    name: 'College Lecture Class',
    code: 'GEN101',
    subject: 'General Academic',
    mentorName: 'Campus Faculty',
  };
}

export const attendanceService = {
  /**
   * Get attendance records for a student with optional class filter
   *
   * @param {string} studentId
   * @param {string} [classFilter='all']
   * @returns {Promise<Array<Object>>}
   */
  async getAttendanceRecords(studentId, classFilter = 'all') {
    const effectiveStudentId = studentId || 'user_student_1';

    if (isSupabaseConfigured && studentId) {
      try {
        let query = supabase
          .from('attendance_records')
          .select('*')
          .eq('student_id', studentId)
          .order('session_date', { ascending: false });

        if (classFilter && classFilter !== 'all') {
          query = query.eq('class_id', classFilter);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map((r) => {
            const meta = resolveClassMeta(r.class_id);
            return {
              ...r,
              class_name: meta.name,
              class_code: meta.code,
              subject: r.subject || meta.subject,
              mentor_name: meta.mentorName,
            };
          });
        }
      } catch (err) {
        console.warn('[attendanceService] Supabase getAttendanceRecords error, using cache:', err.message);
      }
    }

    await delay(150);
    const records = getStoredAttendance();

    let studentRecords = records.filter((r) => r.student_id === effectiveStudentId);
    if (studentRecords.length === 0 && effectiveStudentId === 'user_student_1') {
      studentRecords = records.filter((r) => r.student_id === 'user_student_1');
    }

    if (classFilter && classFilter !== 'all') {
      studentRecords = studentRecords.filter((r) => {
        const meta = resolveClassMeta(r.class_id);
        return r.class_id === classFilter || meta.id === classFilter || meta.code === classFilter;
      });
    }

    return studentRecords
      .map((r) => {
        const meta = resolveClassMeta(r.class_id);
        return {
          ...r,
          class_name: meta.name,
          class_code: meta.code,
          subject: r.subject || meta.subject,
          mentor_name: meta.mentorName,
        };
      })
      .sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime());
  },

  /**
   * Get attendance statistics, threshold warnings, and class breakdown
   *
   * @param {string} studentId
   * @returns {Promise<Object>}
   */
  async getAttendanceStats(studentId) {
    const records = await this.getAttendanceRecords(studentId, 'all');

    const totalSessions = records.length;
    const presentCount = records.filter((r) => r.status === 'present').length;
    const lateCount = records.filter((r) => r.status === 'late').length;
    const absentCount = records.filter((r) => r.status === 'absent').length;

    const attendedCount = presentCount + lateCount;
    const overallPercentage =
      totalSessions > 0 ? Math.round((attendedCount / totalSessions) * 100) : 100;

    const isBelowThreshold = overallPercentage < 75;

    let sessionsNeeded = 0;
    if (isBelowThreshold && totalSessions > 0) {
      const diff = 0.75 * totalSessions - attendedCount;
      sessionsNeeded = Math.max(1, Math.ceil(diff / 0.25));
    }

    // Per-class breakdown
    const classMap = {};
    for (const record of records) {
      const meta = resolveClassMeta(record.class_id);
      const key = meta.id;
      if (!classMap[key]) {
        classMap[key] = {
          classId: meta.id,
          className: meta.name,
          classCode: meta.code,
          subject: meta.subject,
          mentorName: meta.mentorName,
          total: 0,
          present: 0,
          late: 0,
          absent: 0,
        };
      }
      classMap[key].total += 1;
      if (record.status === 'present') classMap[key].present += 1;
      else if (record.status === 'late') classMap[key].late += 1;
      else if (record.status === 'absent') classMap[key].absent += 1;
    }

    const classBreakdown = Object.values(classMap).map((item) => {
      const attended = item.present + item.late;
      const percentage = item.total > 0 ? Math.round((attended / item.total) * 100) : 100;
      return {
        ...item,
        attended,
        percentage,
        isBelowThreshold: percentage < 75,
      };
    });

    return {
      totalSessions,
      presentCount,
      lateCount,
      absentCount,
      attendedCount,
      overallPercentage,
      isBelowThreshold,
      threshold: 75,
      sessionsNeeded,
      classBreakdown,
    };
  },

  /**
   * Get full weekly timetable
   *
   * @param {string} studentId
   * @returns {Promise<Array<Object>>}
   */
  async getTimetable(studentId) {
    await delay(120);
    const timetable = getStoredTimetable();
    return [...timetable].sort((a, b) => a.day_index - b.day_index);
  },

  /**
   * Get attendance records for a class on a specific date
   *
   * @param {string} classId
   * @param {string} sessionDate YYYY-MM-DD
   * @returns {Promise<{ hasExisting: boolean, recordsMap: Record<string, 'present'|'absent'|'late'>, records: Array<Object> }>}
   */
  async getClassSessionAttendance(classId, sessionDate) {
    if (isSupabaseConfigured && classId && sessionDate) {
      try {
        const { data, error } = await supabase
          .from('attendance_records')
          .select('*')
          .eq('class_id', classId)
          .eq('session_date', sessionDate);

        if (!error && data && data.length > 0) {
          const recordsMap = {};
          for (const r of data) {
            recordsMap[r.student_id] = r.status;
          }
          return {
            hasExisting: true,
            recordsMap,
            records: data,
          };
        }
      } catch (err) {
        console.warn('[attendanceService] Supabase getClassSessionAttendance error, using cache:', err.message);
      }
    }

    await delay(120);
    const records = getStoredAttendance();
    const sessionRecords = records.filter((r) => {
      const meta = resolveClassMeta(r.class_id);
      const matchesClass = r.class_id === classId || meta.id === classId || meta.code === classId;
      return matchesClass && r.session_date === sessionDate;
    });

    const recordsMap = {};
    for (const r of sessionRecords) {
      recordsMap[r.student_id] = r.status;
    }

    return {
      hasExisting: sessionRecords.length > 0,
      recordsMap,
      records: sessionRecords,
    };
  },

  /**
   * Save (create or update) class session attendance.
   * Reopening the same class and date edits existing records without creating duplicates.
   *
   * @param {Object} params
   * @param {string} params.classId
   * @param {string} params.sessionDate YYYY-MM-DD
   * @param {string} [params.subject]
   * @param {Array<{ studentId: string, status: 'present'|'absent'|'late' }>} params.studentStatuses
   * @returns {Promise<{ count: number, sessionDate: string, classId: string }>}
   */
  async saveClassSessionAttendance({ classId, sessionDate, subject, studentStatuses = [] }) {
    const classMeta = resolveClassMeta(classId);

    // Save to Supabase if configured
    if (isSupabaseConfigured && classId && sessionDate && studentStatuses.length > 0) {
      try {
        const rows = studentStatuses.map((item) => ({
          class_id: classId,
          student_id: item.studentId,
          session_date: sessionDate,
          subject: subject || classMeta.subject || 'Class Lecture',
          status: item.status || 'present',
        }));

        await supabase
          .from('attendance_records')
          .upsert(rows, { onConflict: 'class_id,student_id,session_date' });
      } catch (err) {
        console.warn('[attendanceService] Supabase saveClassSessionAttendance error, using cache:', err.message);
      }
    }

    await delay(180);
    const currentRecords = getStoredAttendance();

    // Remove any existing records for this specific class and date to guarantee zero duplicates!
    const filteredRecords = currentRecords.filter((r) => {
      const meta = resolveClassMeta(r.class_id);
      const isThisClass = r.class_id === classId || meta.id === classId || meta.code === classId;
      const isThisDate = r.session_date === sessionDate;
      return !(isThisClass && isThisDate);
    });

    const timestamp = new Date().toISOString();
    const newRecords = studentStatuses.map((item, idx) => ({
      id: `att_${classId}_${sessionDate.replace(/-/g, '')}_${item.studentId || idx}`,
      class_id: classId,
      class_code: classMeta.code,
      subject: subject || classMeta.subject || 'Class Lecture',
      student_id: item.studentId,
      session_date: sessionDate,
      status: item.status || 'present',
      created_at: timestamp,
    }));

    const updatedAllRecords = [...newRecords, ...filteredRecords];
    storage.set(ATTENDANCE_STORAGE_KEY, updatedAllRecords);

    // Update student telemetry in campus_class_students
    const storedStudents = storage.get('campus_class_students', null);
    if (storedStudents && Array.isArray(storedStudents)) {
      const updatedStudents = storedStudents.map((student) => {
        if (student.class_id === classId || classMeta.id === student.class_id) {
          const thisStudentRecords = updatedAllRecords.filter(
            (r) => r.student_id === student.id
          );
          if (thisStudentRecords.length > 0) {
            const attended = thisStudentRecords.filter(
              (r) => r.status === 'present' || r.status === 'late'
            ).length;
            const newAttendancePct = Math.round((attended / thisStudentRecords.length) * 100);

            const attDelta = Math.round(
              ((newAttendancePct - (student.attendance_pct || 80)) / 100) * 20
            );
            const newScore = Math.max(0, Math.min(100, (student.current_score || 70) + attDelta));

            return {
              ...student,
              attendance_pct: newAttendancePct,
              current_score: newScore,
            };
          }
        }
        return student;
      });
      storage.set('campus_class_students', updatedStudents);
    }

    // Dispatch events
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('anushasan:attendance_updated', {
          detail: { classId, sessionDate },
        })
      );
      window.dispatchEvent(new Event('anushasan:alerts_updated'));
    }

    return {
      count: newRecords.length,
      sessionDate,
      classId,
    };
  },

  /**
   * Get attendance history for a class, grouped by session date
   *
   * @param {string} classId
   * @returns {Promise<Array<Object>>}
   */
  async getClassAttendanceHistory(classId) {
    let classRecords = [];

    if (isSupabaseConfigured && classId) {
      try {
        const { data, error } = await supabase
          .from('attendance_records')
          .select('*')
          .eq('class_id', classId)
          .order('session_date', { ascending: false });

        if (!error && data && data.length > 0) {
          classRecords = data;
        }
      } catch (err) {
        console.warn('[attendanceService] Supabase getClassAttendanceHistory error, using cache:', err.message);
      }
    }

    if (classRecords.length === 0) {
      await delay(150);
      const records = getStoredAttendance();
      classRecords = records.filter((r) => {
        const meta = resolveClassMeta(r.class_id);
        return r.class_id === classId || meta.id === classId || meta.code === classId;
      });
    }

    const classMeta = resolveClassMeta(classId);
    const sessionMap = {};

    for (const r of classRecords) {
      if (!r.session_date) continue;
      const dateKey = r.session_date;

      if (!sessionMap[dateKey]) {
        sessionMap[dateKey] = {
          date: dateKey,
          classId: classId,
          className: classMeta.name,
          classCode: classMeta.code,
          subject: r.subject || classMeta.subject,
          total: 0,
          present: 0,
          late: 0,
          absent: 0,
        };
      }

      sessionMap[dateKey].total += 1;
      if (r.status === 'present') sessionMap[dateKey].present += 1;
      else if (r.status === 'late') sessionMap[dateKey].late += 1;
      else if (r.status === 'absent') sessionMap[dateKey].absent += 1;
    }

    const historyList = Object.values(sessionMap).map((session) => {
      const attended = session.present + session.late;
      const percentage = session.total > 0 ? Math.round((attended / session.total) * 100) : 100;
      return {
        ...session,
        attended,
        percentage,
        isBelowThreshold: percentage < 75,
      };
    });

    return historyList.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },

  /**
   * Save an updated or newly created single attendance record
   *
   * @param {Object} record
   * @returns {Promise<Object>}
   */
  async saveAttendanceRecord(record) {
    if (isSupabaseConfigured && record.class_id && record.student_id && record.session_date) {
      try {
        await supabase
          .from('attendance_records')
          .upsert(
            {
              class_id: record.class_id,
              student_id: record.student_id,
              session_date: record.session_date,
              subject: record.subject,
              status: record.status || 'present',
            },
            { onConflict: 'class_id,student_id,session_date' }
          );
      } catch (err) {
        console.warn('[attendanceService] Supabase saveAttendanceRecord error:', err.message);
      }
    }

    await delay(150);
    const current = getStoredAttendance();
    const index = current.findIndex((r) => r.id === record.id);

    let updated;
    if (index >= 0) {
      updated = [...current];
      updated[index] = { ...updated[index], ...record };
    } else {
      const newRec = {
        ...record,
        id: record.id || `att_${Date.now()}`,
      };
      updated = [newRec, ...current];
    }

    storage.set(ATTENDANCE_STORAGE_KEY, updated);
    return record;
  },
};

export default attendanceService;
