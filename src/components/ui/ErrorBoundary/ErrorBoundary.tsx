import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Optional custom fallback UI. Defaults to a generic error card. */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary — Catches runtime errors in child component trees.
 *
 * Wrap any component that may crash (e.g. WebGL globe, third-party widgets)
 * to prevent the entire app from going blank.
 *
 * Usage:
 *   <ErrorBoundary fallback={<p>Globe failed to load.</p>}>
 *     <GlobeView />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // TODO: Replace with a real error tracking service (e.g. Sentry) in production
    console.error('[ErrorBoundary] Caught error:', error.message);
    console.error('[ErrorBoundary] Component stack:', info.componentStack);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: 40,
            background: '#0a0a0a',
            color: '#ffffff',
            textAlign: 'center',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          <h2 style={{ fontSize: '1.5rem', marginBottom: 12 }}>Something went wrong</h2>
          <p style={{ color: '#a1a1aa', marginBottom: 24 }}>
            An unexpected error occurred. Please reload the page or try again.
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            style={{
              padding: '10px 24px',
              background: '#ffffff',
              color: '#000000',
              border: 'none',
              borderRadius: 8,
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
