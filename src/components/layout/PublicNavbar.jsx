import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Logo, Button } from '../common';
import { useAuth } from '../../context/AuthContext';
import { getRoleDestination } from '../../pages/public/Auth';
import { ROUTES } from '../../routes/routeConfig';
import './PublicNavbar.css';

export function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleNavClick = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="public-navbar">
      <div className="container public-navbar__container">
        <Link to={ROUTES.landing} className="public-navbar__logo" aria-label="Anushasan home">
          <Logo size="md" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="public-navbar__links" aria-label="Main Navigation">
          <button type="button" onClick={() => handleNavClick('about')} className="public-navbar__link">
            About
          </button>
          <button type="button" onClick={() => handleNavClick('features')} className="public-navbar__link">
            Features
          </button>
          <button type="button" onClick={() => handleNavClick('how-it-works')} className="public-navbar__link">
            How it works
          </button>
          <button type="button" onClick={() => handleNavClick('roles')} className="public-navbar__link">
            Roles
          </button>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="public-navbar__actions">
          {user ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(getRoleDestination(user))}
              >
                Go to Portal
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={async () => {
                  await logout();
                  navigate(`${ROUTES.auth}?mode=login`);
                }}
              >
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`${ROUTES.auth}?mode=login`)}
              >
                Log in
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`${ROUTES.auth}?mode=signup`)}
              >
                Get started
              </Button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          className="public-navbar__toggle"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="public-navbar__mobile-drawer">
          <nav className="public-navbar__mobile-links">
            <button type="button" onClick={() => handleNavClick('about')} className="public-navbar__mobile-link">
              About
            </button>
            <button type="button" onClick={() => handleNavClick('features')} className="public-navbar__mobile-link">
              Features
            </button>
            <button type="button" onClick={() => handleNavClick('how-it-works')} className="public-navbar__mobile-link">
              How it works
            </button>
            <button type="button" onClick={() => handleNavClick('roles')} className="public-navbar__mobile-link">
              Roles
            </button>
          </nav>
          <div className="public-navbar__mobile-actions">
            {user ? (
              <>
                <Button
                  variant="primary"
                  size="md"
                  className="public-navbar__mobile-btn"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(getRoleDestination(user));
                  }}
                >
                  Go to Portal
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  className="public-navbar__mobile-btn"
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await logout();
                    navigate(`${ROUTES.auth}?mode=login`);
                  }}
                >
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="md"
                  className="public-navbar__mobile-btn"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(`${ROUTES.auth}?mode=login`);
                  }}
                >
                  Log in
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  className="public-navbar__mobile-btn"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(`${ROUTES.auth}?mode=signup`);
                  }}
                >
                  Get started
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default PublicNavbar;
