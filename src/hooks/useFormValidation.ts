'use client';

import { useState } from 'react';
import * as Yup from 'yup';

interface UseFormValidationProps<T> {
  initialValues: T;
  validationSchema: Yup.Schema<any>;
}

export function useFormValidation<T extends Record<string, any>>({ 
  initialValues, 
  validationSchema 
}: UseFormValidationProps<T>) {
  const [formValues, setFormValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormValues({
      ...formValues,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const validateForm = async (): Promise<boolean> => {
    try {
      await validationSchema.validate(formValues, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const validationErrors: Partial<Record<keyof T, string>> = {};
        err.inner.forEach((error) => {
          if (error.path) {
            validationErrors[error.path as keyof T] = error.message;
          }
        });
        setErrors(validationErrors);
      }
      return false;
    }
  };

  const setFieldValue = (field: keyof T, value: any) => {
    setFormValues({
      ...formValues,
      [field]: value
    });
  };

  const resetForm = () => {
    setFormValues(initialValues);
    setErrors({});
  };

  return {
    formValues,
    setFormValues,
    errors,
    setErrors,
    handleChange,
    validateForm,
    setFieldValue,
    resetForm
  };
}

export default useFormValidation; 