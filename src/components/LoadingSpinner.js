import Spinner from 'react-bootstrap/Spinner';

function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="loading-state">
      <Spinner animation="border" className="loading-spinner" />
      <div className="text-muted mt-2">{label}</div>
    </div>
  );
}

export default LoadingSpinner;
