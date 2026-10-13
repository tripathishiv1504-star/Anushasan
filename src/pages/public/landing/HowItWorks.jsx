import React from 'react';
import { UserCheck, Compass, Sparkles } from 'lucide-react';
import { Card } from '../../../components/common';
import './HowItWorks.css';

const STEPS = [
  {
    stepNumber: '01',
    icon: UserCheck,
    title: 'Sign Up in Seconds',
    description:
      'Create an account with your campus email address. No complicated onboarding forms or setup delays.',
  },
  {
    stepNumber: '02',
    icon: Compass,
    title: 'Choose Your Role & Mode',
    description:
      'Select Student, Mentor, or Admin portal. Students can connect to a class with a 6-digit code or choose self-paced solo mode.',
  },
  {
    stepNumber: '03',
    icon: Sparkles,
    title: 'Start Growing Consistently',
    description:
      'Log daily study sessions, access faculty notes and PYQs, maintain streaks, and watch your discipline score rise.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="how-it-works" aria-label="How Anushasan Works">
      <div className="container">
        <div className="how-it-works__header">
          <span className="how-it-works__eyebrow">Seamless Flow</span>
          <h2 className="how-it-works__title">How It Works</h2>
          <p className="how-it-works__subtitle">
            Get started in three transparent steps designed to eliminate friction for students and faculty.
          </p>
        </div>

        <div className="how-it-works__grid">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <Card key={idx} padding="lg" className="how-it-works__card">
                <div className="how-it-works__top">
                  <span className="how-it-works__number">{step.stepNumber}</span>
                  <div className="how-it-works__icon-wrap">
                    <Icon size={24} />
                  </div>
                </div>
                <h3 className="how-it-works__step-title">{step.title}</h3>
                <p className="how-it-works__step-desc">{step.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
