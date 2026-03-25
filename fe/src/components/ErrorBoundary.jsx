import { Component } from "react";
import { AlertCircle } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center py-24">
          <div className="glass-card rounded-2xl p-10 text-center max-w-sm space-y-4">
            <AlertCircle
              className="w-10 h-10 text-red-400 mx-auto"
              strokeWidth={1.5}
            />
            <h2
              className="text-lg font-semibold"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Something went wrong
            </h2>
            <p className="text-sm text-muted-foreground">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
