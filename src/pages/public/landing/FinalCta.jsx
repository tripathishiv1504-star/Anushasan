import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../../../components/common';
import { ROUTES } from '../../../routes/routeConfig';
import './FinalCta.css';

export function FinalCta() {
  const navigate = useNavigate();

  return (
    <section className="final-cta" aria-label="Call to Action">
      <div className="container">
        <div className="final-cta__box">
          <div className="final-cta__content">
            <span className="final-cta__badge">
              <Sparkles size={14} /> Start Your Journey Today
            </span>
            <h2 className="final-cta__headline">
              Ready to Turn Daily Effort into Measured Success?
            </h2>
            <p className="final-cta__subtext">
              Join students and mentors creating a more transparent, disciplined, and supportive college experience.
            </p>
          </div>

          <div className="final-cta__actions">
            <Button
              variant="primary"
              size="lg"
              icon={ArrowRight}
              onClick={() => navigate(`${ROUTES.auth}?mode=signup`)}
              className="final-cta__btn-primary"
            >
              Get started for free
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate(`${ROUTES.auth}?mode=login`)}
              className="final-cta__btn-secondary"
            >
              Already have an account? Log in
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FinalCta;
