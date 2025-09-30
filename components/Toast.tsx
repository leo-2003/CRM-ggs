
import React, { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon } from './Icons';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onDismiss: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onDismiss }) => {
  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-green-600/90' : 'bg-red-600/90';
  const borderColor = isSuccess ? 'border-green-500' : 'border-red-500';
  const Icon = isSuccess ? CheckCircleIcon : XCircleIcon;

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000); // Auto-dismiss after 5 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [onDismiss]);

  return (
    <div className={`flex items-start p-4 rounded-lg shadow-lg text-white ${bgColor} border ${borderColor} backdrop-blur-sm animate-fade-in-up`}>
      <div className="flex-shrink-0">
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="ml-3 w-0 flex-1 pt-0.5">
        <p className="text-sm font-medium">{message}</p>
      </div>
      <div className="ml-4 flex-shrink-0 flex">
        <button onClick={onDismiss} className="inline-flex rounded-md text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white">
          <span className="sr-only">Close</span>
          &times;
        </button>
      </div>
    </div>
  );
};

export default Toast;
