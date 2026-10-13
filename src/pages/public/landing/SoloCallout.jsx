import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/common';
import { ROUTES } from '../../../routes/routeConfig';
import './SoloCallout.css';

export function SoloCallout() {
  const navigate = useNavigate();

  return (
    <section className="solo-callout" aria-label="Solo Study Mode Callout">
      <div className="container">
        <div className="solo-callout__banner">
          <div className="solo-callout__icon-wrap">
            <Compass size={32} />
          </div>

          <div className="solo-callout__content">
            <span className="solo-callout__badge">No Mentor Required</span>
            <h3 className="solo-callout__title">Studying Independently? Prepare Solo with Full Features</h3>
            <p className="solo-callout__text">
              You do not need a faculty class code to build unbreakable discipline. Anushasan offers a dedicated <strong>Prepare solo</strong> mode with session timers, custom habit streaks, and personal document storage. If your class joins later, you can link with your mentor anytime from your profile without losing your streak.
            </p>
          </div>

          <div className="solo-callout__action">
            <Button
              variant="primary"
              size="lg"
              icon={ArrowRight}
              onClick={() => navigate(`${ROUTES.auth}?mode=signup`)}
            >
              Start Solo Today
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SoloCallout;
