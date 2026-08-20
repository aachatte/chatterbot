import React from 'react';
import logger from '../services/logger';

/**
 * Error Boundary component to catch and handle React component errors
 * Prevents entire app from crashing if a component has an error
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to service
    logger.error('Component Error Caught', {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });

    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.errorBox}>
            <h1 style={styles.title}>⚠️ Something went wrong</h1>
            <p style={styles.message}>
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={styles.details}>
                <summary style={styles.summary}>Error Details (Development Only)</summary>
                <pre style={styles.pre}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            
            <div style={styles.actions}>
              <button onClick={this.handleReset} style={styles.button}>
                Try Again
              </button>
              <button
                onClick={() => (window.location.href = '/dashboard')}
                style={{ ...styles.button, ...styles.secondaryButton }}
              >
                Go to Dashboard
              </button>
            </div>

            {this.state.errorCount > 3 && (
              <p style={styles.warning}>
                Multiple errors detected. Please refresh the page or contact support.
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: 'var(--cb-bg-secondary, #f5f5f5)',
    padding: '20px'
  },
  errorBox: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '40px',
    maxWidth: '500px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: 'var(--cb-text-primary, #333)',
    marginBottom: '16px'
  },
  message: {
    fontSize: '14px',
    color: 'var(--cb-text-secondary, #666)',
    marginBottom: '24px',
    lineHeight: '1.5'
  },
  details: {
    marginBottom: '24px',
    textAlign: 'left'
  },
  summary: {
    cursor: 'pointer',
    fontWeight: '500',
    color: 'var(--cb-primary, #007bff)',
    marginBottom: '8px'
  },
  pre: {
    backgroundColor: '#f5f5f5',
    padding: '12px',
    borderRadius: '4px',
    fontSize: '12px',
    overflow: 'auto',
    maxHeight: '200px',
    color: '#d32f2f',
    fontFamily: 'monospace'
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    marginTop: '24px'
  },
  button: {
    padding: '10px 20px',
    backgroundColor: 'var(--cb-primary, #007bff)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },
  secondaryButton: {
    backgroundColor: 'var(--cb-bg-secondary, #f0f0f0)',
    color: 'var(--cb-text-primary, #333)'
  },
  warning: {
    color: '#d32f2f',
    fontSize: '12px',
    marginTop: '16px'
  }
};

export default ErrorBoundary;
