import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../Header/Header";
import "./AppLayout.css";

export default function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="app-layout">
      <Header
        onMenuOpen={() => setIsMobileMenuOpen(true)}
        onMenuClose={() => setIsMobileMenuOpen(false)}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      {isMobileMenuOpen && (
        <div
          className="app-layout__backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <main className="app-layout__main">
        <Outlet context={{ isMobileMenuOpen, setIsMobileMenuOpen }} />
      </main>
    </div>
  );
}
