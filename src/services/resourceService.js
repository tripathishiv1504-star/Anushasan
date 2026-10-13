/**
 * Resource Service (Phase 2 - Step 21e)
 * Connected to Supabase Storage ('resources' bucket) and public.resources table,
 * with full backward-compatible local cache and demo fallback.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { storageClient } from '../lib/storageClient';
import { storage } from '../utils/storage';
import { INITIAL_RESOURCES } from '../mock/resources';

const RESOURCES_STORAGE_KEY = 'campus_resources';
const MEMBERS_STORAGE_KEY = 'class_members';

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

function getStoredResources() {
  const resources = storage.get(RESOURCES_STORAGE_KEY, null);
  if (!resources || !Array.isArray(resources) || resources.length === 0) {
    storage.set(RESOURCES_STORAGE_KEY, INITIAL_RESOURCES);
    return INITIAL_RESOURCES;
  }
  return resources;
}

function getStoredMembers() {
  return storage.get(MEMBERS_STORAGE_KEY, []);
}

export const resourceService = {
  /**
   * Get resources filtered by tab, search keyword, subject, type, and sort
   */
  async getResources({
    studentId,
    studyMode = 'class',
    tab = 'class',
    search = '',
    subject = '',
    type = '',
    sort = 'newest',
  }) {
    const isSolo = studyMode === 'solo';
    const effectiveTab = isSolo ? 'my_files' : tab;

    // 1. Fetch from live Supabase if configured
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('resources').select('*');

        if (effectiveTab === 'my_files') {
          query = query.eq('is_personal', true);
          if (studentId) {
            query = query.eq('owner_id', studentId);
          }
        } else {
          query = query.eq('is_personal', false);
          if (studentId) {
            // Get student's enrolled class IDs
            const { data: enrollments } = await supabase
              .from('class_members')
              .select('class_id')
              .eq('student_id', studentId);

            const enrolledIds = (enrollments || []).map((e) => e.class_id);
            if (enrolledIds.length > 0) {
              query = query.in('class_id', enrolledIds);
            }
          }
        }

        if (subject && subject !== 'all') {
          query = query.ilike('subject', subject);
        }
        if (type && type !== 'all') {
          query = query.eq('type', type);
        }

        const { data: remoteResources, error } = await query;

        if (!error && remoteResources && remoteResources.length > 0) {
          let list = remoteResources;

          if (search && search.trim()) {
            const q = search.trim().toLowerCase();
            list = list.filter(
              (r) =>
                (r.title && r.title.toLowerCase().includes(q)) ||
                (r.file_name && r.file_name.toLowerCase().includes(q)) ||
                (r.subject && r.subject.toLowerCase().includes(q))
            );
          }

          return list.sort((a, b) => {
            if (sort === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
            if (sort === 'title') return (a.title || '').localeCompare(b.title || '');
            if (sort === 'size') return (b.file_size_kb || 0) - (a.file_size_kb || 0);
            return new Date(b.created_at) - new Date(a.created_at);
          });
        }
      } catch (err) {
        console.warn('[resourceService] Supabase getResources error, using cache:', err.message);
      }
    }

    // 2. Local Fallback Cache
    await delay(150);
    const all = getStoredResources();

    let filtered = all.filter((r) => {
      if (effectiveTab === 'my_files') {
        return (
          Boolean(r.is_personal) &&
          (r.owner_id === studentId ||
            r.owner_id === 'user_student_1' ||
            r.owner_id === 'user_student_solo')
        );
      }

      if (r.is_personal) return false;

      if (studentId) {
        const members = getStoredMembers();
        const enrolledClassIds = members
          .filter((m) => m.student_id === studentId)
          .map((m) => m.class_id);

        if (enrolledClassIds.length > 0) {
          const normalizedEnrolled = new Set(enrolledClassIds);
          if (enrolledClassIds.includes('class_os_301')) normalizedEnrolled.add('class_cs301');
          if (enrolledClassIds.includes('class_cs301')) normalizedEnrolled.add('class_os_301');
          if (enrolledClassIds.includes('class_dsa_201')) normalizedEnrolled.add('class_ds201');
          if (enrolledClassIds.includes('class_ds201')) normalizedEnrolled.add('class_dsa_201');

          return normalizedEnrolled.has(r.class_id);
        }
      }

      return true;
    });

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (r) =>
          (r.title && r.title.toLowerCase().includes(q)) ||
          (r.file_name && r.file_name.toLowerCase().includes(q)) ||
          (r.subject && r.subject.toLowerCase().includes(q))
      );
    }

    if (subject && subject !== 'all') {
      filtered = filtered.filter(
        (r) => r.subject && r.subject.toLowerCase() === subject.toLowerCase()
      );
    }

    if (type && type !== 'all') {
      filtered = filtered.filter(
        (r) => r.type && r.type.toLowerCase() === type.toLowerCase()
      );
    }

    return [...filtered].sort((a, b) => {
      if (sort === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sort === 'title') return (a.title || '').localeCompare(b.title || '');
      if (sort === 'size') return (b.file_size_kb || 0) - (a.file_size_kb || 0);
      return new Date(b.created_at) - new Date(a.created_at);
    });
  },

  /**
   * Upload a personal study resource with Supabase Storage upload
   */
  async uploadPersonalResource({
    studentId,
    title,
    subject,
    type = 'notes',
    fileName = 'document.pdf',
    fileSizeKb = 500,
    file = null,
  }) {
    let filePath = null;
    let fileUrl = null;

    // 1. Upload to Supabase Storage if file object is provided
    if (isSupabaseConfigured && file) {
      const cleanName = (fileName || file.name || 'document.pdf').replace(/[^a-zA-Z0-9.-]/g, '_');
      const targetPath = `personal/${studentId || 'student'}/${Date.now()}_${cleanName}`;
      const uploadRes = await storageClient.uploadPdf(targetPath, file);
      filePath = uploadRes.path;
      fileUrl = uploadRes.url;
    }

    const newResource = {
      id: `res_p_${Date.now()}`,
      owner_id: studentId,
      class_id: null,
      title: (title || '').trim(),
      subject: (subject || '').trim(),
      type: type || 'notes',
      file_name: fileName,
      file_size_kb: Math.round(Number(fileSizeKb) || 500),
      file_path: filePath,
      file_url: fileUrl,
      is_personal: true,
      uploader_name: 'You (Personal)',
      created_at: new Date().toISOString(),
    };

    // 2. Persist in Supabase DB if configured
    if (isSupabaseConfigured && studentId) {
      try {
        const { data, error } = await supabase
          .from('resources')
          .insert({
            owner_id: studentId,
            class_id: null,
            title: newResource.title,
            subject: newResource.subject,
            type: newResource.type,
            file_name: newResource.file_name,
            file_size_kb: newResource.file_size_kb,
            file_path: newResource.file_path,
            file_url: newResource.file_url,
            is_personal: true,
          })
          .select('*')
          .maybeSingle();

        if (data) {
          newResource.id = data.id;
        }
      } catch (err) {
        console.warn('[resourceService] Supabase personal resource insert error:', err.message);
      }
    }

    // 3. Cache locally
    const all = getStoredResources();
    const updated = [newResource, ...all];
    storage.set(RESOURCES_STORAGE_KEY, updated);

    return newResource;
  },

  /**
   * Delete a personal resource
   */
  async deleteResource(resourceId, studentId) {
    const all = getStoredResources();
    const target = all.find((r) => r.id === resourceId);

    if (target?.file_path && isSupabaseConfigured) {
      await storageClient.removeFile(target.file_path);
    }

    if (isSupabaseConfigured) {
      try {
        await supabase.from('resources').delete().eq('id', resourceId);
      } catch (err) {
        console.warn('[resourceService] Supabase deleteResource warning:', err.message);
      }
    }

    const filtered = all.filter((r) => r.id !== resourceId);
    storage.set(RESOURCES_STORAGE_KEY, filtered);
    return { success: true };
  },

  /**
   * Get all class resources uploaded by a mentor
   */
  async getMentorResources(mentorId) {
    if (isSupabaseConfigured && mentorId) {
      try {
        const { data: remoteData, error } = await supabase
          .from('resources')
          .select('*, classes(name)')
          .eq('owner_id', mentorId)
          .eq('is_personal', false)
          .order('created_at', { ascending: false });

        if (!error && remoteData && remoteData.length > 0) {
          return remoteData.map((r) => ({
            ...r,
            class_name: r.classes?.name || r.class_name || '',
          }));
        }
      } catch (err) {
        console.warn('[resourceService] Supabase getMentorResources error:', err.message);
      }
    }

    const all = getStoredResources();
    return all
      .filter((r) => !r.is_personal && (r.owner_id === mentorId || mentorId === 'user_mentor_1'))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  /**
   * Upload one or multiple class resources (for mentors) with storage bucket upload
   */
  async uploadClassResources({
    mentorId,
    mentorName,
    classId,
    className,
    subject,
    type = 'notes',
    title,
    description = '',
    dueDate = null,
    files = [],
  }) {
    if (!classId) throw new Error('Please select a target class section.');
    if (!subject || !subject.trim()) throw new Error('Subject is required.');
    if (!title || title.trim().length < 3) throw new Error('Title must be at least 3 characters long.');
    if (!files || files.length === 0) throw new Error('Please select at least one PDF document to upload.');

    const all = getStoredResources();
    const createdResources = [];

    for (let index = 0; index < files.length; index++) {
      const file = files[index];

      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      if (!isPdf) throw new Error(`"${file.name}" is not a PDF. Only PDF files are permitted.`);

      if (file.size > 10 * 1024 * 1024) {
        throw new Error(`"${file.name}" exceeds the 10 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
      }

      const cleanFileName = file.name;
      const cleanBase = cleanFileName.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
      const resourceTitle = files.length > 1 ? `${title.trim()} - ${cleanBase}` : title.trim();

      // 1. Upload file to Supabase Storage
      let filePath = null;
      let fileUrl = null;
      if (isSupabaseConfigured) {
        const safeName = cleanFileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const targetPath = `classes/${classId}/${Date.now()}_${index}_${safeName}`;
        const uploadRes = await storageClient.uploadPdf(targetPath, file);
        filePath = uploadRes.path;
        fileUrl = uploadRes.url;
      }

      const newResource = {
        id: `res_m_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 4)}`,
        owner_id: mentorId,
        class_id: classId,
        class_name: className || '',
        title: resourceTitle,
        description: description ? description.trim() : '',
        due_date: type === 'assignment' && dueDate ? dueDate : null,
        subject: subject.trim(),
        type: type,
        file_name: cleanFileName,
        file_size_kb: Math.round(file.size / 1024) || 300,
        file_path: filePath,
        file_url: fileUrl,
        is_personal: false,
        uploader_name: mentorName || 'Faculty Mentor',
        created_at: new Date(Date.now() + index * 1000).toISOString(),
      };

      // 2. Persist in Supabase DB
      if (isSupabaseConfigured && mentorId) {
        try {
          const { data: dbData } = await supabase
            .from('resources')
            .insert({
              owner_id: mentorId,
              class_id: classId,
              title: newResource.title,
              instructions: newResource.description,
              due_date: newResource.due_date,
              subject: newResource.subject,
              type: newResource.type,
              file_name: newResource.file_name,
              file_size_kb: newResource.file_size_kb,
              file_path: newResource.file_path,
              file_url: newResource.file_url,
              is_personal: false,
            })
            .select('*')
            .maybeSingle();

          if (dbData) {
            newResource.id = dbData.id;
          }
        } catch (dbErr) {
          console.warn('[resourceService] Supabase insert resource error:', dbErr.message);
        }
      }

      createdResources.push(newResource);
    }

    const updatedAll = [...createdResources, ...all];
    storage.set(RESOURCES_STORAGE_KEY, updatedAll);

    return createdResources;
  },

  /**
   * Delete a mentor class resource
   */
  async deleteClassResource(resourceId, mentorId) {
    const all = getStoredResources();
    const target = all.find((r) => r.id === resourceId);

    if (target?.file_path && isSupabaseConfigured) {
      await storageClient.removeFile(target.file_path);
    }

    if (isSupabaseConfigured) {
      try {
        await supabase.from('resources').delete().eq('id', resourceId);
      } catch (err) {
        console.warn('[resourceService] Supabase deleteClassResource warning:', err.message);
      }
    }

    const filtered = all.filter((r) => r.id !== resourceId);
    storage.set(RESOURCES_STORAGE_KEY, filtered);
    return { success: true };
  },

  /**
   * Retrieve distinct subjects for filtering
   */
  async getDistinctSubjects() {
    if (isSupabaseConfigured) {
      try {
        const { data } = await supabase.from('resources').select('subject');
        if (data && data.length > 0) {
          const s = new Set();
          data.forEach((r) => {
            if (r.subject) s.add(r.subject);
          });
          return Array.from(s).sort();
        }
      } catch (err) {
        console.warn('[resourceService] Supabase distinct subjects error:', err.message);
      }
    }

    const all = getStoredResources();
    const subjects = new Set();
    all.forEach((r) => {
      if (r.subject) subjects.add(r.subject);
    });
    return Array.from(subjects).sort();
  },
};

export default resourceService;
