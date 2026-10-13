import React from 'react';
import { TrendingUp, AlertCircle, Sparkles } from 'lucide-react';
import { Card } from '../../../components/common';
import './About.css';

export function About() {
  return (
    <section id="about" className="about" aria-label="About the Problem and Solution">
      <div className="container">
        <div className="about__header">
          <span className="about__eyebrow">The Academic Dilemma</span>
          <h2 className="about__title">The Problem with Invisible Study Effort</h2>
          <p className="about__description">
            In collegiate education, daily study effort is nearly invisible. Attendance logs, internal marks, and syllabus materials live in separate silos. Mentors usually discover a student is struggling only after exam results arrive — when it is already too late to intervene.
          </p>
          <p className="about__solution">
            <strong>Anushasan bridges this gap:</strong> translating daily study sessions, task completions, and attendance into a clear, unified Discipline Score. Early-risk alerts empower faculty mentors to support students proactively, while self-paced solo students can cultivate steady study habits independently.
          </p>
        </div>

        <div className="about__grid">
          <Card padding="md" className="about__card">
            <div className="about__card-icon about__card-icon--teal">
              <TrendingUp size={24} />
            </div>
            <div className="about__card-stat">+35% Consistency Lift</div>
            <h3 className="about__card-heading">Measured Study Habits</h3>
            <p className="about__card-text">
              Students logging daily focused sessions with the built-in timer show significantly higher semester exam readiness.
            </p>
          </Card>

          <Card padding="md" className="about__card">
            <div className="about__card-icon about__card-icon--amber">
              <AlertCircle size={24} />
            </div>
            <div className="about__card-stat">Early-Risk Detection</div>
            <h3 className="about__card-heading">Proactive Mentorship</h3>
            <p className="about__card-text">
              Mentors receive instant warnings when a student's weekly discipline score drops by 15+ points, preventing semester failures.
            </p>
          </Card>

          <Card padding="md" className="about__card">
            <div className="about__card-icon about__card-icon--indigo">
              <Sparkles size={24} />
            </div>
            <div className="about__card-stat">100% Flexible</div>
            <h3 className="about__card-heading">Dual Study Modes</h3>
            <p className="about__card-text">
              Join a guided campus class with mentor resources, or prepare solo at your own pace without requiring any faculty setup.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}

export default About;
