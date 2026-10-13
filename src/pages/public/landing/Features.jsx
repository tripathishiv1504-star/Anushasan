import React from 'react';
import {
  Target,
  Timer,
  CheckSquare,
  Award,
  FolderArchive,
  CalendarCheck,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { Card } from '../../../components/common';
import './Features.css';

const FEATURE_LIST = [
  {
    icon: Target,
    title: 'Discipline Score',
    description:
      'Objective 0–100 weekly score computed from study consistency, task completion, habit execution, and class attendance.',
    tag: 'Core Metric',
  },
  {
    icon: Timer,
    title: 'Study Tracker',
    description:
      'Focus timer supporting customizable study sessions with subject tags, personal reflection logs, and real-time pause states.',
    tag: 'Focus Tool',
  },
  {
    icon: CheckSquare,
    title: 'Habits and Goals',
    description:
      'Daily routine check-ins paired with target milestones and progress tracking to reinforce regular college preparation.',
    tag: 'Habit Formation',
  },
  {
    icon: Award,
    title: 'Streaks and Badges',
    description:
      'Milestone badges celebrating 7-day consistency, 100 study hours, perfect task weeks, and persistent academic effort.',
    tag: 'Motivation',
  },
  {
    icon: FolderArchive,
    title: 'Resource Library',
    description:
      'Organized subject files including lecture notes, official assignments, and previous-year question (PYQ) papers.',
    tag: 'Study Materials',
  },
  {
    icon: CalendarCheck,
    title: 'Attendance & Timetable',
    description:
      'Synchronized class timetable and session attendance logs allowing students to monitor their presence percentage.',
    tag: 'Class Sync',
  },
  {
    icon: AlertTriangle,
    title: 'Early-Risk Alerts',
    description:
      'Automated notifications flagging students whose discipline score drops below 50 or slips by 15+ points week-over-week.',
    tag: 'Mentor Safety Net',
  },
  {
    icon: TrendingUp,
    title: 'Weekly Growth Report',
    description:
      'Automated weekly performance reports highlighting hours studied, goal completions, and key discipline insights.',
    tag: 'Analytics',
  },
];

export function Features() {
  return (
    <section id="features" className="features" aria-label="Key Features">
      <div className="container">
        <div className="features__header">
          <span className="features__eyebrow">Complete Toolkit</span>
          <h2 className="features__title">Built for Modern Campus Consistency</h2>
          <p className="features__subtitle">
            Every feature in Anushasan serves a single purpose: turning daily effort into measurable academic achievement.
          </p>
        </div>

        <div className="features__grid">
          {FEATURE_LIST.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <Card key={index} padding="md" interactive className="features__card">
                <div className="features__card-header">
                  <div className="features__icon-wrap">
                    <Icon size={22} />
                  </div>
                  <span className="features__tag">{feat.tag}</span>
                </div>
                <h3 className="features__card-title">{feat.title}</h3>
                <p className="features__card-desc">{feat.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Features;
