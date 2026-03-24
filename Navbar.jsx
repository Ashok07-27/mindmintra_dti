import { Link, NavLink } from "react-router-dom";
import { HeartHandshake, LogOut } from "lucide-react";
import { useAuth } from "./AuthContext";

function linkClass({ isActive }) {
  return `rounded-full px-4 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-white text-ink shadow"
      : "text-slate-600 hover:bg-white/70 hover:text-ink"
  }`;
}

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-4 z-20 mx-auto mb-8 flex max-w-7xl items-center justify-between rounded-full border border-white/70 bg-white/70 px-4 py-3 shadow-soft backdrop-blur-xl">
      <Link to="/" className="flex items-center gap-3 font-bold text-ink">
        <span className="rounded-full bg-gradient-to-r from-calm to-bloom p-2 text-white">
          <HeartHandshake size={18} />
        </span>
        MindMitra
      </Link>

      {user && (
        <nav className="hidden items-center gap-2 md:flex">
          <NavLink to="/" className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/create" className={linkClass}>
            Create Post
          </NavLink>
          <NavLink to="/chat" className={linkClass}>
            Chat
          </NavLink>
          <NavLink to="/profile" className={linkClass}>
            Profile
          </NavLink>
          <NavLink to="/help" className={linkClass}>
            Nearby Help
          </NavLink>
          {user.role === "admin" && (
            <NavLink to="/admin" className={linkClass}>
              Admin
            </NavLink>
          )}
        </nav>
      )}

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="hidden text-sm text-slate-500 sm:block">
              Hi, {user.username}
            </span>
            <button
              onClick={logout}
              className="secondary-btn flex items-center gap-2 !px-4 !py-2 text-sm"
            >
              <LogOut size={16} />
              Logout
            </button>
          </>
        ) : (
          <Link to="/auth" className="primary-btn !px-4 !py-2 text-sm">
            Login
          </Link>
        )}
      </div>
    </header>
  );
}



