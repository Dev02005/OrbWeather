import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Without this, a render error anywhere in the tree unmounts the whole app and
 * leaves a blank page. Catching it keeps the shell up and offers a way out.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled render error:', error, info.componentStack);
  }

  private handleReset = () => {
    this.setState({ error: null });
  };

  private handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="error-boundary" role="alert">
        <AlertTriangle size={40} className="error-boundary-icon" aria-hidden="true" />
        <h1>Something went wrong</h1>
        <p>
          OrbWeather hit an unexpected error. Trying again usually clears it — if it
          keeps happening, returning to the dashboard will reset the view.
        </p>
        <div className="error-boundary-actions">
          <button type="button" className="error-boundary-btn primary" onClick={this.handleReset}>
            Try again
          </button>
          <button type="button" className="error-boundary-btn" onClick={this.handleReload}>
            Back to dashboard
          </button>
        </div>
        <details className="error-boundary-details">
          <summary>Technical details</summary>
          <pre>{this.state.error.message}</pre>
        </details>
      </div>
    );
  }
}
