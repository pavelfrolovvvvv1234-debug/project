import { useState } from "react";
import { NavLink, Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "./Layout";

const nav = [
  { to: "/", label: "Главная" },
  { to: "/networks", label: "Сети" },
  { to: "/sites", label: "Сайты" },
];

const apiDocsUrl = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "/api/docs")
  : "http://localhost:3001/api/docs";

export function AppShell() {
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const sidebar = (
    <>
      <div className="mb-8">
        <h1 className="text-lg font-bold text-cyan-400">SiteNet Manager</h1>
        <p className="text-xs text-slate-500">SiteNet</p>
        {user.role === "admin" && (
          <p className="text-xs text-amber-400 mt-1">Режим администратора</p>
        )}
      </div>
      <nav className="space-y-1 flex-1">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-sm transition ${
                isActive
                  ? "bg-cyan-600/20 text-cyan-300 font-medium"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
        <a
          href={apiDocsUrl}
          target="_blank"
          rel="noreferrer"
          className="block px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800"
        >
          Документация API ↗
        </a>
      </nav>
      <div className="pt-4 border-t border-slate-800">
        <p className="text-xs text-slate-500 truncate">{user.email}</p>
        <Button variant="ghost" className="mt-2 w-full" onClick={logout}>
          Выйти
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/80">
        <span className="font-bold text-cyan-400">SiteNet</span>
        <Button variant="secondary" onClick={() => setMenuOpen((v) => !v)}>
          {menuOpen ? "Закрыть" : "Меню"}
        </Button>
      </div>

      {menuOpen && (
        <aside className="lg:hidden border-b border-slate-800 bg-slate-900/95 p-4 flex flex-col max-h-[70vh] overflow-auto">
          {sidebar}
        </aside>
      )}

      <aside className="hidden lg:flex w-64 border-r border-slate-800 bg-slate-900/50 p-4 flex-col shrink-0">
        {sidebar}
      </aside>

      <main className="flex-1 p-4 sm:p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
