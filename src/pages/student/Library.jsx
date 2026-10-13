import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Upload,
  FolderLock,
  Layers,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { resourceService } from '../../services/resourceService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import ResourceCard from '../../components/common/ResourceCard';
import FileUpload from '../../components/common/FileUpload';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import './Library.css';

export function Library() {
  const { user } = useAuth();
  const studentId = user?.id || 'user_student_1';
  const studyMode = user?.study_mode || 'class';
  const isSolo = studyMode === 'solo';

  // Tabs: 'class' | 'my_files' (Solo students locked to 'my_files')
  const [activeTab, setActiveTab] = useState(isSolo ? 'my_files' : 'class');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Data states
  const [resources, setResources] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Keep solo users locked to 'my_files'
  useEffect(() => {
    if (isSolo) {
      setActiveTab('my_files');
    }
  }, [isSolo]);

  // Load resources from service
  const loadResources = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [fetchedResources, distinctSubjects] = await Promise.all([
        resourceService.getResources({
          studentId,
          studyMode,
          tab: isSolo ? 'my_files' : activeTab,
          search: searchQuery,
          subject: selectedSubject,
          type: selectedType,
          sort: sortBy,
        }),
        resourceService.getDistinctSubjects(),
      ]);

      setResources(fetchedResources);
      setAvailableSubjects(distinctSubjects);
    } catch (err) {
      console.error('[Library] Failed to load resources:', err);
      setError(err.message || 'Failed to load library resources. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [studentId, studyMode, isSolo, activeTab, searchQuery, selectedSubject, selectedType, sortBy]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  // Handle Personal Upload
  const handleUpload = async (uploadData) => {
    try {
      setIsUploading(true);
      await resourceService.uploadPersonalResource({
        studentId,
        ...uploadData,
      });
      setIsUploadModalOpen(false);
      // Switch to 'my_files' tab so student immediately sees their uploaded document
      if (!isSolo) setActiveTab('my_files');
      await loadResources();
    } catch (err) {
      console.error('[Library] Upload failed:', err);
      alert('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Personal Delete
  const handleDeleteResource = async (resourceId) => {
    try {
      await resourceService.deleteResource(resourceId, studentId);
      await loadResources();
    } catch (err) {
      console.error('[Library] Delete failed:', err);
      alert('Delete failed: ' + err.message);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSubject('all');
    setSelectedType('all');
    setSortBy('newest');
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedSubject !== 'all' ||
    selectedType !== 'all' ||
    sortBy !== 'newest';

  const subjectOptions = [
    { value: 'all', label: 'All Subjects' },
    ...availableSubjects.map((s) => ({ value: s, label: s })),
  ];

  const typeOptions = [
    { value: 'all', label: 'All Document Types' },
    { value: 'notes', label: 'Lecture Notes' },
    { value: 'assignment', label: 'Assignments' },
    { value: 'pyq', label: 'Previous Year Questions (PYQ)' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'title', label: 'Title (A-Z)' },
    { value: 'size', label: 'File Size (Largest)' },
  ];

  return (
    <div className="resource-library">
      {/* Header */}
      <div className="resource-library__header">
        <div>
          <h1 className="resource-library__title">Resource Library</h1>
          <p className="resource-library__subtitle">
            {isSolo
              ? 'Your personal digital binder for cheatsheets, formulas, and study PDFs.'
              : 'Access mentor-curated lecture notes, class assignments, and personal study files.'}
          </p>
        </div>

        <Button
          variant="primary"
          icon={Upload}
          onClick={() => setIsUploadModalOpen(true)}
        >
          Upload Document
        </Button>
      </div>

      {/* Solo Mode Information Callout */}
      {isSolo && (
        <div className="resource-library__solo-notice">
          <FolderLock size={18} />
          <span>
            <strong>Solo Study Mode:</strong> You are viewing your personal library. Upload PDFs up to 10 MB to keep your semester materials in one place.
          </span>
        </div>
      )}

      {/* Navigation Tabs (Only shown in Class Mode per spec) */}
      {!isSolo && (
        <div className="resource-library__tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'class'}
            className={`library-tab ${activeTab === 'class' ? 'library-tab--active' : ''}`}
            onClick={() => setActiveTab('class')}
          >
            <Layers size={16} />
            <span>Class Resources</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'my_files'}
            className={`library-tab ${activeTab === 'my_files' ? 'library-tab--active' : ''}`}
            onClick={() => setActiveTab('my_files')}
          >
            <FileCheck size={16} />
            <span>My Personal Files</span>
          </button>
        </div>
      )}

      {/* Search & Filters Toolbar */}
      <Card className="library-toolbar" padding="md">
        <div className="library-toolbar__search">
          <div className="search-input-wrap">
            <Search size={18} className="search-input-icon" />
            <input
              type="text"
              placeholder="Search by title, subject, or filename..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input-control"
              aria-label="Search resources"
            />
          </div>
        </div>

        <div className="library-toolbar__filters">
          <Select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            options={subjectOptions}
            className="filter-select"
            aria-label="Filter by subject"
          />

          <Select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            options={typeOptions}
            className="filter-select"
            aria-label="Filter by document type"
          />

          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={sortOptions}
            className="filter-select"
            aria-label="Sort documents"
          />

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="reset-filters-btn"
            >
              Reset
            </Button>
          )}
        </div>
      </Card>

      {/* Results Header */}
      <div className="library-results-meta">
        <span className="results-count">
          Showing <strong>{resources.length}</strong> {resources.length === 1 ? 'document' : 'documents'}
          {activeTab === 'class' && !isSolo ? ' in Class Resources' : ' in My Files'}
        </span>
      </div>

      {/* Resources Cards Grid */}
      {isLoading ? (
        <div className="library-loading">
          <LoadingState message="Fetching study documents..." />
        </div>
      ) : error ? (
        <div className="library-error">
          <ErrorState
            title="Failed to load library"
            message={error}
            onRetry={loadResources}
          />
        </div>
      ) : resources.length === 0 ? (
        <Card padding="lg">
          <EmptyState
            icon={BookOpen}
            title={
              hasActiveFilters
                ? 'No matching documents found'
                : activeTab === 'class'
                ? 'No class resources uploaded yet'
                : 'No personal files uploaded yet'
            }
            description={
              hasActiveFilters
                ? 'Try broadening your search term or resetting the subject and type filters.'
                : activeTab === 'class'
                ? 'Your course mentors have not uploaded materials for your enrolled classes yet.'
                : 'Upload your own revision notes, question banks, or formula sheets to keep them handy.'
            }
            actionText={
              hasActiveFilters
                ? 'Reset Filters'
                : activeTab === 'my_files' || isSolo
                ? 'Upload First Document'
                : undefined
            }
            onAction={
              hasActiveFilters
                ? handleResetFilters
                : activeTab === 'my_files' || isSolo
                ? () => setIsUploadModalOpen(true)
                : undefined
            }
          />
        </Card>
      ) : (
        <div className="resource-cards-grid">
          {resources.map((res) => (
            <ResourceCard
              key={res.id}
              resource={res}
              onDelete={handleDeleteResource}
            />
          ))}
        </div>
      )}

      {/* Personal Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Study Material"
        maxWidth="550px"
      >
        <FileUpload
          subjects={availableSubjects.length > 0 ? availableSubjects : ['Operating Systems', 'Data Structures', 'General']}
          onUpload={handleUpload}
          isUploading={isUploading}
          onCancel={() => setIsUploadModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

export default Library;
