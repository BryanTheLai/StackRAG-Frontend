import React from 'react';
import { CheckCircle, X as CloseIcon } from 'lucide-react';

interface NotificationProps {
  message: React.ReactNode;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, onClose }) => {
  return (
    <div
      className="fixed top-6 right-6 z-50 shadow-lg rounded-lg px-4 py-3 flex items-center gap-3 bg-white border border-success text-success"
      style={{ minWidth: 320, maxWidth: 400 }}
      role="alert"
    >
      <CheckCircle size={24} className="flex-shrink-0 text-success" />
      <div className="flex-1 text-sm uppercase font-medium text-black">{message}</div>
      <button
        className="btn btn-sm btn-circle btn-ghost hover:bg-base-200"
        onClick={onClose}
        aria-label="Close notification"
      >
        <CloseIcon size={20} className="text-black" />
      </button>
    </div>
  );
};

export default Notification;
