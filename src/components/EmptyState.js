import Button from 'react-bootstrap/Button';
import { FaInbox } from 'react-icons/fa6';

function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <FaInbox />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel && onAction ? <Button onClick={onAction}>{actionLabel}</Button> : null}
    </div>
  );
}

export default EmptyState;
