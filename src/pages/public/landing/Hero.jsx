import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { Button, Badge } from '../../../components/common';
import { ROUTES } from '../../../routes/routeConfig';
import './Hero.css';

export function Hero() {
  const navigate = useNavigate();

  const handleScrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero" aria-label="Hero Section">
      <div className="container hero__container">
        {/* Left Column: Headlines & Actions */}
        <div className="hero__content">
          <Badge variant="success" size="md" className="hero__badge">
            Smart Campus Discipline Platform
          </Badge>

          <h1 className="hero__headline">
            Build Study Discipline. Track Real Consistency. Grow Together.
          </h1>

          <p className="hero__subtext">
            The unified campus workspace measuring daily study habits, attendance, and resources — empowering students, mentors, and administrators.
          </p>

          <div className="hero__actions">
            <Button
              variant="primary"
              size="lg"
              icon={ArrowRight}
              onClick={() => navigate(`${ROUTES.auth}?mode=signup`)}
            >
              Get started
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={handleScrollToHowItWorks}
            >
              See how it works
            </Button>
          </div>

          <div className="hero__trust">
            <div className="hero__trust-item">
              <span className="hero__trust-bullet">✓</span>
              <span>Zero clutter</span>
            </div>
            <div className="hero__trust-item">
              <span className="hero__trust-bullet">✓</span>
              <span>Self-paced solo mode</span>
            </div>
            <div className="hero__trust-item">
              <span className="hero__trust-bullet">✓</span>
              <span>Early mentor intervention</span>
            </div>
          </div>
        </div>

        {/* Right Column: CSS-built Dashboard Preview Card (No External Images) */}
        <div className="hero__preview">
          <div className="preview-card">
            {/* Top Row: Streak chip and class tag */}
            <div className="preview-card__header">
              <div className="preview-card__streak">
                <Flame size={16} className="preview-card__flame" />
                <span>12-Day Streak</span>
              </div>
              <span className="preview-card__tag">Computer Science &bull; CS-301</span>
            </div>

            {/* Middle Row: Score Ring and Metric */}
            <div className="preview-card__score-box">
              <div className="preview-card__ring-wrapper">
                {/* CSS Conic Gradient Ring */}
                <div className="preview-card__ring">
                  <div className="preview-card__ring-inner">
                    <span className="preview-card__score-number">88</span>
                    <span className="preview-card__score-total">/ 100</span>
                  </div>
                </div>
              </div>

              <div className="preview-card__score-details">
                <span className="preview-card__score-label">Weekly Discipline Score</span>
                <span className="preview-card__score-status">Consistent momentum (+12%)</span>
                <div className="preview-card__stats-mini">
                  <span>Attendance: <strong>95%</strong></span>
                  <span>Tasks: <strong>8/10</strong></span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Two realistic task rows */}
            <div className="preview-card__tasks">
              <span className="preview-card__tasks-title">Today's Focus Tasks</span>

              <div className="preview-card__task-item preview-card__task-item--done">
                <CheckCircle2 size={18} className="preview-card__task-icon" />
                <div className="preview-card__task-info">
                  <span className="preview-card__task-name">Review Operating Systems Chapter 4</span>
                  <span className="preview-card__task-time">Completed &bull; 45 mins</span>
                </div>
              </div>

              <div className="preview-card__task-item">
                <Circle size={18} className="preview-card__task-icon" />
                <div className="preview-card__task-info">
                  <span className="preview-card__task-name">Database Normalization PYQ Assignment</span>
                  <span className="preview-card__task-time">Due today &bull; 6:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
