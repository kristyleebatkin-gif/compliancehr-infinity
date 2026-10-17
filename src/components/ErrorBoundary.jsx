import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

// Per-route error boundary: a crash in one module shows a friendly recovery
// screen instead of blanking the whole app.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Module error:', error, info);
  }

  handleReset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="mx-auto mt-10 max-w-md rounded-2xl border border-danger/20 bg-card p-8 text-center shadow-sm">
        <AlertTriangle className="mx-auto h-10 w-10 text-danger" />
        <h1 className="mt-4 text-xl font-bold font-display">This page hit a snag</h1>
        <p className="mt-2 text-sm text-foreground/60">
          Something went wrong while loading this module. The rest of the app is unaffected.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm"
          >
            <RotateCcw className="h-4 w-4" /> Try again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground/70 hover:bg-muted/50"
          >
            Reload app
          </button>
        </div>
      </div>
    );
  }
}