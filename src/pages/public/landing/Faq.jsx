import React from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import './Faq.css';

const FAQS = [
  {
    question: 'Can I use Anushasan without a mentor or college class?',
    answer:
      'Yes, absolutely. When selecting your study mode, pick "Prepare solo". Solo mode gives you complete access to the study tracker, focus timer, personal habit logging, custom goals, and personal file storage without needing any faculty setup or class codes.',
  },
  {
    question: 'How is the Discipline Score calculated?',
    answer:
      'The Discipline Score is a weekly metric out of 100 points. In class mode, it weights study session consistency (35 points), completed tasks (25 points), habit logs (20 points), and attendance (20 points). In solo mode, the points are distributed across consistency (40), tasks (30), and habits (30).',
  },
  {
    question: 'What happens when a student is marked "at risk"?',
    answer:
      'A student is highlighted as at-risk if their weekly discipline score drops below 50, or if their score drops by 15 or more points compared to the previous week. Mentors can view these alerts on their dashboard to reach out, review grievances, and provide supportive guidance before exams.',
  },
  {
    question: 'Can mentors upload study materials and previous-year question papers?',
    answer:
      'Yes. Mentors can organize and upload PDF resources categorized by class, subject, and type (Lecture Notes, Official Assignments, or Previous-Year Questions). Students enrolled in that class code can view, filter, and reference these materials anytime.',
  },
  {
    question: 'Can I switch between Solo mode and Class mode later?',
    answer:
      'Yes. If your college mentor creates a class code later in the semester, you can simply open your Student Profile, enter the 6-character class join code, and convert to Class mode without losing your previous streaks, badges, or logged hours.',
  },
];

export function Faq() {
  return (
    <section id="faq" className="faq" aria-label="Frequently Asked Questions">
      <div className="container">
        <div className="faq__header">
          <span className="faq__eyebrow">Clear Answers</span>
          <h2 className="faq__title">Frequently Asked Questions</h2>
          <p className="faq__subtitle">
            Everything you need to know about Anushasan's scoring, roles, and setup.
          </p>
        </div>

        <div className="faq__list">
          {FAQS.map((faq, index) => (
            <details key={index} className="faq__item">
              <summary className="faq__question">
                <span className="faq__question-text">{faq.question}</span>
                <ChevronDown size={18} className="faq__chevron" />
              </summary>
              <div className="faq__answer">
                <p>{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Faq;
