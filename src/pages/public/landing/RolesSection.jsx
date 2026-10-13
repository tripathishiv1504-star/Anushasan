import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, ShieldAlert, Check } from 'lucide-react';
import { Card, Button } from '../../../components/common';
import { ROUTES } from '../../../routes/routeConfig';
import './RolesSection.css';

export function RolesSection() {
  const navigate = useNavigate();

  return (
    <section id="roles" className="roles-section" aria-label="Portal Roles">
      <div className="container">
        <div className="roles-section__header">
          <span className="roles-section__eyebrow">Tailored Experiences</span>
          <h2 className="roles-section__title">Three Portals, One Unified Campus</h2>
          <p className="roles-section__subtitle">
            Whether you are studying for your next semester, mentoring batches, or overseeing the department.
          </p>
        </div>

        <div className="roles-section__grid">
          {/* Student Role */}
          <Card padding="lg" className="role-card role-card--student">
            <div className="role-card__top">
              <div className="role-card__icon-wrap">
                <GraduationCap size={28} />
              </div>
              <span className="role-card__badge">Student Portal</span>
            </div>

            <h3 className="role-card__title">For Students</h3>
            <p className="role-card__desc">
              Build lasting study consistency, track real milestones, access class resources, or study solo.
            </p>

            <ul className="role-card__features">
              <li><Check size={16} className="role-card__check" /> Real-time study tracker with focus timer</li>
              <li><Check size={16} className="role-card__check" /> Transparent 0–100 weekly Discipline Score</li>
              <li><Check size={16} className="role-card__check" /> Access notes, assignments, and PYQs</li>
              <li><Check size={16} className="role-card__check" /> Class mode or self-paced solo study option</li>
            </ul>

            <div className="role-card__actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
              <Button
                variant="primary"
                size="md"
                className="role-card__btn"
                onClick={() => navigate(`${ROUTES.auth}?mode=login&role=student`)}
              >
                Log in as Student
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="role-card__btn-sub"
                onClick={() => navigate(`${ROUTES.auth}?mode=signup&role=student`)}
              >
                Explore / Create Account
              </Button>
            </div>
          </Card>

          {/* Mentor Role */}
          <Card padding="lg" className="role-card role-card--mentor">
            <div className="role-card__top">
              <div className="role-card__icon-wrap">
                <Users size={28} />
              </div>
              <span className="role-card__badge">Mentor Portal</span>
            </div>

            <h3 className="role-card__title">For Mentors</h3>
            <p className="role-card__desc">
              Guide student cohorts, share course materials, monitor class attendance, and protect at-risk students.
            </p>

            <ul className="role-card__features">
              <li><Check size={16} className="role-card__check" /> Create classes with simple 6-digit join codes</li>
              <li><Check size={16} className="role-card__check" /> Upload syllabus notes, assignments, and PYQs</li>
              <li><Check size={16} className="role-card__check" /> Early-risk alerts before exam failures</li>
              <li><Check size={16} className="role-card__check" /> Mark attendance and resolve student grievances</li>
            </ul>

            <div className="role-card__actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
              <Button
                variant="primary"
                size="md"
                className="role-card__btn"
                onClick={() => navigate(`${ROUTES.auth}?mode=login&role=mentor`)}
              >
                Log in as Mentor
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="role-card__btn-sub"
                onClick={() => navigate(`${ROUTES.auth}?mode=signup&role=mentor`)}
              >
                Explore / Create Account
              </Button>
            </div>
          </Card>

          {/* Admin Role */}
          <Card padding="lg" className="role-card role-card--admin">
            <div className="role-card__top">
              <div className="role-card__icon-wrap">
                <ShieldAlert size={28} />
              </div>
              <span className="role-card__badge">Admin Authority</span>
            </div>

            <h3 className="role-card__title">For Administrators</h3>
            <p className="role-card__desc">
              High-level department oversight, aggregated student analytics, mentor allocations, and counselling.
            </p>

            <ul className="role-card__features">
              <li><Check size={16} className="role-card__check" /> Department setup with mentors and classes</li>
              <li><Check size={16} className="role-card__check" /> Aggregated discipline and attendance trends</li>
              <li><Check size={16} className="role-card__check" /> Escalated grievance resolution workflows</li>
              <li><Check size={16} className="role-card__check" /> Cohort counselling interventions and reports</li>
            </ul>

            <div className="role-card__actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
              <Button
                variant="primary"
                size="md"
                className="role-card__btn"
                onClick={() => navigate(`${ROUTES.auth}?mode=login&role=admin`)}
              >
                Log in as Admin
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="role-card__btn-sub"
                onClick={() => navigate(`${ROUTES.auth}?mode=signup&role=admin`)}
              >
                Explore / Create Account
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

export default RolesSection;
