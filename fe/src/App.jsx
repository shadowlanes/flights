import { Routes, Route, Link, NavLink, useNavigate } from "react-router";
import { useSession, signIn, signOut } from "./lib/auth-client";
import { Plane, Plus, LogOut, LayoutDashboard, Archive, Radio, History, MapIcon, BarChart3 } from "lucide-react";
import ErrorBoundary from "./components/ErrorBoundary";
import Dashboard from "./pages/Dashboard";
import AddFlight from "./pages/AddFlight";
import FlightDetail from "./pages/FlightDetail";
import ArchivePage from "./pages/Archive";

const FLIGHT_PATHS = [
  { top: "12%", duration: "18s", delay: "0s" },
  { top: "28%", duration: "14s", delay: "3s" },
  { top: "45%", duration: "22s", delay: "7s" },
  { top: "62%", duration: "16s", delay: "1s" },
  { top: "78%", duration: "20s", delay: "5s" },
  { top: "35%", duration: "15s", delay: "9s" },
  { top: "55%", duration: "19s", delay: "12s" },
  { top: "88%", duration: "17s", delay: "4s" },
];

const FLYING_PLANES = [
  { top: "20%", duration: "16s", delay: "2s" },
  { top: "50%", duration: "20s", delay: "6s" },
  { top: "72%", duration: "14s", delay: "0s" },
  { top: "38%", duration: "18s", delay: "10s" },
];

const AIRPORT_CODES = [
  { code: "JFK", top: "15%", left: "8%", duration: "10s", delay: "0s" },
  { code: "DXB", top: "35%", left: "82%", duration: "12s", delay: "2s" },
  { code: "SIN", top: "70%", left: "70%", duration: "9s", delay: "5s" },
  { code: "LHR", top: "22%", left: "55%", duration: "11s", delay: "1s" },
  { code: "NRT", top: "55%", left: "15%", duration: "13s", delay: "7s" },
  { code: "CDG", top: "80%", left: "35%", duration: "10s", delay: "3s" },
  { code: "SFO", top: "42%", left: "92%", duration: "12s", delay: "8s" },
  { code: "BKK", top: "65%", left: "48%", duration: "9s", delay: "4s" },
  { code: "SYD", top: "88%", left: "78%", duration: "14s", delay: "6s" },
  { code: "DEL", top: "30%", left: "25%", duration: "11s", delay: "9s" },
  { code: "LAX", top: "48%", left: "5%", duration: "10s", delay: "11s" },
  { code: "ICN", top: "75%", left: "60%", duration: "13s", delay: "2s" },
];

const FEATURES = [
  { icon: Radio, label: "Real-time tracking" },
  { icon: History, label: "Flight history" },
  { icon: MapIcon, label: "Route maps" },
  { icon: BarChart3, label: "Statistics" },
];

function LoginPage() {
  const doSignIn = () => signIn.social({ provider: "google", callbackURL: window.location.origin });

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background layer */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Flight path lines */}
        {FLIGHT_PATHS.map((fp, i) => (
          <div
            key={`path-${i}`}
            className="flight-path"
            style={{ top: fp.top, "--duration": fp.duration, "--delay": fp.delay }}
          />
        ))}

        {/* Flying planes */}
        {FLYING_PLANES.map((fp, i) => (
          <span
            key={`plane-${i}`}
            className="flight-plane"
            style={{ top: fp.top, "--duration": fp.duration, "--delay": fp.delay }}
          >
            ✈
          </span>
        ))}

        {/* Ghost airport codes */}
        {AIRPORT_CODES.map((ac) => (
          <span
            key={ac.code}
            className="airport-code-ghost"
            style={{
              top: ac.top,
              left: ac.left,
              "--duration": ac.duration,
              "--delay": ac.delay,
            }}
          >
            {ac.code}
          </span>
        ))}
      </div>

      {/* Nav bar */}
      <nav className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-5">
        <div className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="Flight" className="w-8 h-8" />
          <span className="heading-lg text-white">Flight</span>
        </div>
        <button onClick={doSignIn} className="btn-glass text-xs px-4 py-2 cursor-pointer">
          Sign In
        </button>
      </nav>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6" style={{ minHeight: "calc(100vh - 180px)" }}>
        <div className="max-w-lg mx-auto space-y-6">
          <h1
            className="hero-stagger text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]"
            style={{ fontFamily: "Outfit, sans-serif", "--delay": "0.1s" }}
          >
            Track every flight.
          </h1>

          <p
            className="hero-stagger text-base sm:text-lg text-white/40 max-w-sm mx-auto leading-relaxed"
            style={{ "--delay": "0.3s" }}
          >
            Monitor delays, view routes, and keep a record of every journey you take.
          </p>

          <div className="hero-stagger" style={{ "--delay": "0.5s" }}>
            <button
              onClick={doSignIn}
              className="btn-glass btn-primary px-8 py-3.5 text-sm cta-glow cursor-pointer"
            >
              Get Started
            </button>
          </div>

          {/* Feature pills */}
          <div
            className="hero-stagger flex flex-wrap justify-center gap-2.5 pt-6"
            style={{ "--delay": "0.7s" }}
          >
            {FEATURES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs text-white/40"
              >
                <Icon className="w-3 h-3" strokeWidth={1.5} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center pb-8">
        <p className="text-[11px] text-white/20">Your personal flight tracker</p>
      </div>
    </div>
  );
}

function AppShell() {
  const { data: session } = useSession();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            {/* Left: Logo + Nav */}
            <div className="flex items-center gap-8">
              <Link
                to="/"
                className="flex items-center gap-2.5 group"
              >
                <img src="/logo.svg" alt="Flight" className="w-8 h-8" />
                <span className="heading-lg text-foreground">Flight</span>
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
                className="btn-glass btn-primary px-3.5 py-1.5"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                <span className="hidden sm:inline">Add Flight</span>
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
      <div className="min-h-screen bg-background flex items-center justify-center">
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
