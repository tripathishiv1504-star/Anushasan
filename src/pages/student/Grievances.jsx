import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertCircle,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  RotateCcw,
  Sparkles,
  Inbox,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { grievanceService } from '../../services/grievanceService';
import { studentService } from '../../services/studentService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import GrievanceCard from '../../components/student/GrievanceCard';
import GrievanceForm from '../../components/student/GrievanceForm';
import GrievanceDetailModal from '../../components/student/GrievanceDetailModal';
import './Grievances.css';

export function Grievances() {
  const { user } = useAuth();
  const studentId = user?.id || 'user_student_1';
  const studentName = user?.full_name || 'Aarav Sharma';

  // Data states
  const [grievances, setGrievances] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, in_review: 0, resolved: 0, escalated: 0 });
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state ('all' | 'open' | 'in_review' | 'resolved' | 'escalated')
  const [activeTab, setActiveTab] = useState('all');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState(null);

  // Load grievances and enrolled classes
  const loadGrievanceData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [listData, statsData, classesData] = await Promise.all([
        grievanceService.getStudentGrievances(studentId, activeTab),
        grievanceService.getGrievanceStats(studentId),
        studentService.getEnrolledClasses(studentId),
      ]);

      setGrievances(listData);
      setStats(statsData);
      setEnrolledClasses(classesData);
    } catch (err) {
      console.error('Failed to load grievances:', err);
      setError(err.message || 'Unable to load grievances. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [studentId, activeTab]);

  useEffect(() => {
    loadGrievanceData();

    const handleGrievanceUpdated = () => {
      loadGrievanceData();
    };

    window.addEventListener('anushasan:grievance_updated', handleGrievanceUpdated);
    return () => {
      window.removeEventListener('anushasan:grievance_updated', handleGrievanceUpdated);
    };
  }, [loadGrievanceData]);

  // Handle new grievance submission
  const handleCreateGrievance = async (formData) => {
    const created = await grievanceService.createGrievance({
      studentId,
      studentName,
      ...formData,
    });

    // Refresh data and switch tab to 'all' or 'open'
    await loadGrievanceData();
    // Open detail of newly created item for instant gratification
    setSelectedGrievance(created);
  };

  const tabs = [
    { key: 'all', label: 'All Issues', count: stats.total },
    { key: 'open', label: 'Open', count: stats.open },
    { key: 'in_review', label: 'In Review', count: stats.in_review },
    { key: 'resolved', label: 'Resolved', count: stats.resolved },
    { key: 'escalated', label: 'Escalated', count: stats.escalated },
  ];

  if (isLoading && grievances.length === 0) {
    return <LoadingState message="Loading your academic grievances..." minHeight="60vh" />;
  }

  if (error && grievances.length === 0) {
    return (
      <ErrorState
        title="Failed to Load Grievances"
        message={error}
        onRetry={loadGrievanceData}
      />
    );
  }

  return (
    <div className="grievances-page animate-fade-in">
      {/* Page Header */}
      <div className="grievances-header">
        <div>
          <h1 className="grievances-title">Academic Grievances</h1>
          <p className="grievances-desc">
            Raise attendance discrepancies, evaluation queries, and lab issues directly with your mentor.
          </p>
        </div>

        <div className="grievances-header-actions">
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsFormOpen(true)}
          >
            Raise Grievance
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadGrievanceData}
            icon={RotateCcw}
            aria-label="Refresh grievances"
          />
        </div>
      </div>

      {/* Top Stat Overview */}
      <div className="grievance-stats-grid">
        <Card className="grievance-stat-card">
          <span className="grievance-stat-label">Total Filed</span>
          <div className="grievance-stat-val">{stats.total}</div>
          <span className="grievance-stat-hint">All academic requests</span>
        </Card>

        <Card className="grievance-stat-card">
          <div className="grievance-stat-top-row">
            <span className="grievance-stat-label">Open</span>
            <Badge variant="info" size="sm">Active</Badge>
          </div>
          <div className="grievance-stat-val text-info">{stats.open}</div>
          <span className="grievance-stat-hint">Awaiting mentor triage</span>
        </Card>

        <Card className="grievance-stat-card">
          <div className="grievance-stat-top-row">
            <span className="grievance-stat-label">In Review</span>
            <Badge variant="warning" size="sm">Pending</Badge>
          </div>
          <div className="grievance-stat-val text-warning">{stats.in_review}</div>
          <span className="grievance-stat-hint">Being investigated</span>
        </Card>

        <Card className="grievance-stat-card">
          <div className="grievance-stat-top-row">
            <span className="grievance-stat-label">Resolved</span>
            <Badge variant="success" size="sm">Closed</Badge>
          </div>
          <div className="grievance-stat-val text-success">{stats.resolved}</div>
          <span className="grievance-stat-hint">Successfully addressed</span>
        </Card>
      </div>

      {/* Status Filter Tabs */}
      <div className="grievances-filter-bar">
        <div className="grievance-tabs" role="tablist" aria-label="Grievance filter tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={isActive}
                className={`grievance-tab-btn ${isActive ? 'grievance-tab-btn--active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <span>{tab.label}</span>
                <span className="grievance-tab-count">{tab.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grievances List */}
      <div className="grievances-list-section">
        {grievances.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={activeTab === 'all' ? 'No Grievances Filed' : `No ${activeTab.replace('_', ' ')} grievances`}
            description={
              activeTab === 'all'
                ? 'You have not raised any academic grievances yet. If you face attendance discrepancies or course issues, your mentor is here to help.'
                : `There are currently no grievances with status "${activeTab.replace('_', ' ')}".`
            }
            actionLabel="Raise a Grievance"
            onAction={() => setIsFormOpen(true)}
          />
        ) : (
          <div className="grievance-cards-list">
            {grievances.map((item) => (
              <GrievanceCard
                key={item.id}
                grievance={item}
                onClick={(g) => setSelectedGrievance(g)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Raise Grievance Modal */}
      <GrievanceForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        enrolledClasses={enrolledClasses}
        onSubmit={handleCreateGrievance}
      />

      {/* Grievance Detail Modal */}
      <GrievanceDetailModal
        grievance={selectedGrievance}
        isOpen={Boolean(selectedGrievance)}
        onClose={() => setSelectedGrievance(null)}
      />
    </div>
  );
}

export default Grievances;
