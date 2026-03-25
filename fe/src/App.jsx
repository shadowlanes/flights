import { Routes, Route, Link, NavLink, useNavigate } from "react-router";
import { useSession, signIn, signOut } from "./lib/auth-client";
import { Plane, Plus, LogOut, LayoutDashboard, Archive } from "lucide-react";
import ErrorBoundary from "./components/ErrorBoundary";
import Dashboard from "./pages/Dashboard";
import AddFlight from "./pages/AddFlight";
import FlightDetail from "./pages/FlightDetail";
import ArchivePage from "./pages/Archive";

function LoginPage() {
  return (
    <div className="atmosphere grain min-h-screen flex items-center justify-center p-4">
      {/* Ambient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/[0.03] blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-500/[0.03] blur-[80px]" />
      </div>

      <div className="relative glass rounded-2xl p-10 max-w-sm w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-400/10 flex items-center justify-center glow-blue">
            <Plane className="w-7 h-7 text-blue-400" strokeWidth={1.5} />
          </div>
          <h1
            className="text-3xl font-semibold tracking-tight"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            Flight
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Track your flights in real time
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Sign in */}
        <button
          onClick={() => signIn.social({ provider: "google" })}
          className="w-full group relative overflow-hidden rounded-xl px-6 py-3.5 font-medium text-sm transition-all duration-300 cursor-pointer"
          style={{
            background:
              "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.08))",
            border: "1px solid rgba(59,130,246,0.2)",
          }}
        >
          <span className="relative z-10 flex items-center justify-center gap-2.5 text-blue-300">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </span>
          <div className="absolute inset-0 bg-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>

        <p className="text-xs text-muted-foreground/60">
          Your personal flight tracker
        </p>
      </div>
    </div>
  );
}

function AppShell() {
  const { data: session } = useSession();
  const navigate = useNavigate();

  return (
    <div className="atmosphere grain min-h-screen">
      {/* Ambient background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 left-1/3 w-[600px] h-[400px] rounded-full bg-blue-500/[0.025] blur-[120px]" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full bg-indigo-500/[0.02] blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[300px] rounded-full bg-sky-500/[0.02] blur-[80px]" />
      </div>

      {/* Navigation */}
      <nav className="glass sticky top-0 z-50 border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            {/* Left: Logo + Nav */}
            <div className="flex items-center gap-8">
              <Link
                to="/"
                className="flex items-center gap-2.5 group"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-400/10 flex items-center justify-center transition-all duration-300 group-hover:border-blue-400/20 group-hover:shadow-[0_0_12px_rgba(59,130,246,0.2)]">
                  <Plane
                    className="w-4 h-4 text-blue-400"
                    strokeWidth={1.5}
                  />
                </div>
                <span
                  className="text-lg font-semibold tracking-tight text-foreground"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  Flight
                </span>
              </Link>

              <div className="hidden sm:flex items-center gap-1">
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "text-foreground bg-white/[0.06] nav-active"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                    }`
                  }
                >
                  <LayoutDashboard className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Dashboard
                </NavLink>
                <NavLink
                  to="/archive"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "text-foreground bg-white/[0.06] nav-active"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                    }`
                  }
                >
                  <Archive className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Archive
                </NavLink>
              </div>
            </div>

            {/* Right: Add + User */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/flights/add")}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(59,130,246,0.06))",
                  border: "1px solid rgba(59,130,246,0.18)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor =
                    "rgba(59,130,246,0.3)";
                  e.currentTarget.style.boxShadow =
                    "0 0 16px rgba(59,130,246,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor =
                    "rgba(59,130,246,0.18)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <Plus className="w-3.5 h-3.5 text-blue-400" strokeWidth={2} />
                <span className="hidden sm:inline text-blue-300">
                  Add Flight
                </span>
              </button>

              <div className="h-5 w-px bg-white/[0.06]" />

              <div className="flex items-center gap-2.5">
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt=""
                    className="w-7 h-7 rounded-full ring-1 ring-white/10"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-xs font-medium text-muted-foreground">
                    {session?.user?.name?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
                <span className="hidden md:block text-sm text-muted-foreground truncate max-w-[120px]">
                  {session?.user?.name}
                </span>
                <button
                  onClick={() => signOut()}
                  className="p-1.5 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.04] transition-all duration-200 cursor-pointer"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-up">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/flights/add" element={<AddFlight />} />
              <Route path="/flights/:id" element={<FlightDetail />} />
              <Route path="/archive" element={<ArchivePage />} />
            </Routes>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}

function App() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="atmosphere min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-400/10 flex items-center justify-center animate-pulse">
            <Plane className="w-5 h-5 text-blue-400" strokeWidth={1.5} />
          </div>
          <div className="h-0.5 w-16 rounded-full overflow-hidden bg-white/[0.04]">
            <div className="h-full w-1/2 bg-blue-400/40 rounded-full animate-[shimmer_1.5s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  return <AppShell />;
}

export default App;
