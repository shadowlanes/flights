import { useSession, signIn, signOut } from "./lib/auth-client";

function App() {
    const { data: session, isPending } = useSession();

    if (isPending) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
                <div className="max-w-md w-full space-y-8 text-center">
                    <h1 className="text-4xl font-bold tracking-tight">Welcome</h1>
                    <p className="text-muted-foreground">Please sign in to access your dashboard</p>
                    <button
                        onClick={() => signIn.social({ provider: "google" })}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                        Sign in with Google
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <nav className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold">App Template</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{session.user.name}</span>
                        <button
                            onClick={() => signOut()}
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-card rounded-xl border border-border p-8 shadow-sm">
                    <h2 className="text-3xl font-bold mb-4">Dashboard</h2>
                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-lg">
                        <div className="text-primary mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4" /><path d="m16.2 7.8 2.9-2.9" /><path d="M18 12h4" /><path d="m16.2 16.2 2.9 2.9" /><path d="M12 18v4" /><path d="m4.9 19.1 2.9-2.9" /><path d="M2 12h4" /><path d="m4.9 4.9 2.9 2.9" /><path d="M8 12a4 4 0 1 0 8 0 4 4 0 1 0-8 0Z" /></svg>
                        </div>
                        <h3 className="text-xl font-semibold">Under Progress</h3>
                        <p className="text-muted-foreground mt-2 text-center max-w-sm">
                            We're building something amazing! Check back soon for updates.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
