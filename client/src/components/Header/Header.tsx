import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.svg";
import { useAuth } from "../../contexts/AuthContext";
import "./Header.css";

type Props = {
  onMenuOpen: () => void;
  onMenuClose: () => void;
  isMobileMenuOpen: boolean;
};

export default function Header({ onMenuOpen, onMenuClose, isMobileMenuOpen }: Props) {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const navigate = useNavigate();

  function getNavLinkClass({ isActive }: { isActive: boolean }) {
    return isActive ? "header__nav-link header__nav-link_active" : "header__nav-link";
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className={isMobileMenuOpen ? "header header_mobile" : "header"}>
      <button
        type="button"
        className="header__menu-btn"
        aria-label="Open menu"
        onClick={onMenuOpen}
      />
      <img src={logo} alt="Mesh AI" className="header__logo" />
      <nav
        className={
          isMobileMenuOpen ? "header__nav header__nav_mobile" : "header__nav"
        }
      >
        {isAuthenticated && (
          <>
            <NavLink to="/knowledge" className={getNavLinkClass} onClick={onMenuClose}>
              Knowledge Base
            </NavLink>
            <NavLink to="/chat" className={getNavLinkClass} onClick={onMenuClose}>
              Chat
            </NavLink>
            <div className="header__account">
              <button
                type="button"
                className="header__dropdown-btn"
                aria-haspopup="menu"
                aria-expanded={isAccountMenuOpen}
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
              >
                {currentUser?.name}'s Account
              </button>
              {isAccountMenuOpen && (
                <ul className="header__menu" role="menu">
                  <li role="none">
                    <button
                      type="button"
                      role="menuitem"
                      className="header__logout-btn"
                      onClick={handleLogout}
                    >
                      Log out
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </>
        )}
      </nav>
    </header>
  );
}
