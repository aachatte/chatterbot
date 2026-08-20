import React from 'react';

/**
 * Loading component for suspense fallback
 */
const Loading = () => {
  return (
    <div style={styles.container}>
      <div style={styles.spinner}>
        <div style={styles.spinnerInner}></div>
      </div>
      <p style={styles.text}>Loading...</p>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: 'var(--cb-bg-primary, #ffffff)',
    gap: '16px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    position: 'relative'
  },
  spinnerInner: {
    width: '100%',
    height: '100%',
    border: '4px solid var(--cb-bg-secondary, #e0e0e0)',
    borderTop: '4px solid var(--cb-primary, #007bff)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  text: {
    color: 'var(--cb-text-secondary, #666)',
    fontSize: '14px',
    fontWeight: '500'
  }
};

// Add keyframe animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

export default Loading;
