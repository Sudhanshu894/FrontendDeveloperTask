'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginStart, loginFailure } from '@/redux/slices/userSlice';

export type ModalType = 'success' | 'error' | 'warning' | 'info';

interface ModalProps {
  title: string;
  message: string;
  type: ModalType;
}

interface UseAuthFormProps {
  initialModalState?: ModalProps;
}

export function useAuthForm({ 
  initialModalState = { title: '', message: '', type: 'success' } 
}: UseAuthFormProps = {}) {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalProps, setModalProps] = useState<ModalProps>(initialModalState);

  const handleOAuthError = (errorMessage: string) => {
    setModalProps({
      title: 'Authentication Error',
      message: errorMessage,
      type: 'error',
    });
    setShowModal(true);
  };

  const showErrorModal = (title: string, message: string) => {
    dispatch(loginFailure(message));
    setModalProps({
      title,
      message,
      type: 'error',
    });
    setShowModal(true);
  };

  const showSuccessModal = (title: string, message: string) => {
    setModalProps({
      title,
      message,
      type: 'success',
    });
    setShowModal(true);
  };

  const showInfoModal = (title: string, message: string) => {
    setModalProps({
      title,
      message,
      type: 'info',
    });
    setShowModal(true);
  };

  const showWarningModal = (title: string, message: string) => {
    setModalProps({
      title,
      message,
      type: 'warning',
    });
    setShowModal(true);
  };

  const startSubmitting = () => {
    setIsSubmitting(true);
    dispatch(loginStart());
  };

  const stopSubmitting = () => {
    setIsSubmitting(false);
  };

  return {
    showModal,
    setShowModal,
    isSubmitting,
    setIsSubmitting,
    modalProps,
    setModalProps,
    handleOAuthError,
    showErrorModal,
    showSuccessModal,
    showInfoModal,
    showWarningModal,
    startSubmitting,
    stopSubmitting
  };
}

export default useAuthForm; 