import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../common';
import { ROUTES } from '../../routes/routeConfig';
import './Footer.css';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer__container">
        <div className="footer__brand">
          <Logo size="md" withTagline />
          <p className="footer__tagline">
            Smart Campus Discipline & Growth Platform. Measuring consistency, empowering student habits, and connecting faculty mentors.
          </p>
        </div>

        <div className="footer__groups">
          <div className="footer__group">
            <h4 className="footer__title">Platform</h4>
            <ul className="footer__list">
              <li><a href="#about" className="footer__link">About the Mission</a></li>
              <li><a href="#features" className="footer__link">Core Features</a></li>
              <li><a href="#how-it-works" className="footer__link">How it Works</a></li>
              <li><a href="#faq" className="footer__link">Frequently Asked Questions</a></li>
            </ul>
          </div>

          <div className="footer__group">
            <h4 className="footer__title">Portals</h4>
            <ul className="footer__list">
              <li><Link to={`${ROUTES.auth}?mode=login`} className="footer__link">Student Portal</Link></li>
              <li><Link to={`${ROUTES.auth}?mode=login`} className="footer__link">Mentor Portal</Link></li>
              <li><Link to={`${ROUTES.auth}?mode=login`} className="footer__link">Admin Authority Portal</Link></li>
              <li><Link to={`${ROUTES.auth}?mode=signup`} className="footer__link">Solo Study Mode</Link></li>
            </ul>
          </div>

          <div className="footer__group">
            <h4 className="footer__title">Campus Solution</h4>
            <ul className="footer__list">
              <li><span className="footer__text">Smart Attendance</span></li>
              <li><span className="footer__text">Resource Management</span></li>
              <li><span className="footer__text">Student Grievances</span></li>
              <li><span className="footer__text">Early-Risk Analytics</span></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-container">
          <p className="footer__copyright">
            &copy; {currentYear} Anushasan Platform. Built for collegiate student growth and discipline.
          </p>
          <p className="footer__note">Designed with simplicity and precision.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
