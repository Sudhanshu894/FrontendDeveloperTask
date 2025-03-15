'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MdCheckCircle, MdError, MdInfo, MdWarning } from 'react-icons/md';
import Button from './Button';

export type ModalType = 'success' | 'error' | 'warning' | 'info';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: ModalType;
  buttonText?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'success',
  buttonText = 'Okay',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <MdCheckCircle style={{ color: 'var(--success)', fontSize: '3rem' }} />;
      case 'error':
        return <MdError style={{ color: 'var(--error)', fontSize: '3rem' }} />;
      case 'warning':
        return <MdWarning style={{ color: '#F59E0B', fontSize: '3rem' }} />;
      case 'info':
        return <MdInfo style={{ color: '#3B82F6', fontSize: '3rem' }} />;
      default:
        return <MdCheckCircle style={{ color: 'var(--success)', fontSize: '3rem' }} />;
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="rounded-lg p-6 w-full max-w-md mx-4 flex flex-col items-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="mb-4">{getIcon()}</div>
        <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--heading)' }}>{title}</h2>
        <p className="text-center mb-6" style={{ color: 'var(--paragraph)' }}>{message}</p>
        <Button onClick={onClose}>{buttonText}</Button>
      </div>
    </div>,
    document.body
  );
};

export default Modal; 