import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  RotateCcw,
  Sparkles,
  Award,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { scoreService } from '../../services/scoreService';
import Button from '../../components/common/Button';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import WeeklySummary from '../../components/student/WeeklySummary';
import BadgeGrid from '../../components/student/BadgeGrid';
import './Report.css';

export function Report() {
  const { user } = useAuth();
  const studentId = user?.id || 'user_student_1';
  const studyMode = user?.study_mode || 'class';

  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadReportData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await scoreService.getStudentReportData(studentId, studyMode);
      setReportData(data);
    } catch (err) {
      console.error('Failed to load weekly report:', err);
      setError(err.message || 'Unable to load weekly report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [studentId, studyMode]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  if (isLoading && !reportData) {
    return (
      <LoadingState
        message="Synthesizing weekly report and evaluating milestone badges..."
        minHeight="65vh"
      />
    );
  }

  if (error && !reportData) {
    return (
      <ErrorState
        title="Unable to Load Growth Report"
        message={error}
        onRetry={loadReportData}
      />
    );
  }

  return (
    <div className="report-page animate-fade-in">
      {/* Page Header */}
      <div className="report-page-header">
        <div>
          <div className="report-page-badge-wrap">
            <span className="report-page-pill">
              <Sparkles size={13} /> Weekly Growth Analysis
            </span>
          </div>
          <h1 className="report-page-title">Weekly Report & Achievements</h1>
          <p className="report-page-desc">
            Review your weekly performance trajectory, habit discipline, and unlock academic milestone badges.
          </p>
        </div>

        <div className="report-header-actions">
          <Button variant="ghost" size="sm" onClick={loadReportData} icon={RotateCcw}>
            Refresh Report
          </Button>
        </div>
      </div>

      {/* 1. Weekly Performance Summary, 3 Insights, and 8-Week Trend Chart */}
      <WeeklySummary reportData={reportData} />

      {/* 2. Achievements & Badges Grid */}
      <BadgeGrid badgesSummary={reportData?.badgesSummary} />
    </div>
  );
}

export default Report;
