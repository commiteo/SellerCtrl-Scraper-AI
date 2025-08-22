/**
 * React Hook for Form Validation
 * Provides real-time validation for forms using the validation library
 */

import { useState, useCallback, useEffect } from 'react';
import { validateData, validateField, ValidationSchema, ValidationError } from '@/lib/validation';

export interface UseValidationOptions {
  schema: ValidationSchema;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
}

export interface ValidationState {
  errors: Record<string, string>;
  isValid: boolean;
  isValidating: boolean;
  touchedFields: Set<string>;
}

export interface ValidationActions {
  validateForm: (data: any) => Promise<boolean>;
  validateField: (fieldName: string, value: any) => Promise<boolean>;
  clearErrors: () => void;
  clearFieldError: (fieldName: string) => void;
  setFieldTouched: (fieldName: string) => void;
  resetValidation: () => void;
  getFieldError: (fieldName: string) => string | undefined;
  hasFieldError: (fieldName: string) => boolean;
  isFieldTouched: (fieldName: string) => boolean;
}

export function useValidation(options: UseValidationOptions): ValidationState & ValidationActions {
  const { schema, validateOnChange = true, validateOnBlur = true, debounceMs = 300 } = options;

  const [state, setState] = useState<ValidationState>({
    errors: {},
    isValid: true,
    isValidating: false,
    touchedFields: new Set()
  });

  // Debounce timer ref
  const debounceTimerRef = useState<NodeJS.Timeout | null>(null)[0];

  // Clear debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef) {
        clearTimeout(debounceTimerRef);
      }
    };
  }, [debounceTimerRef]);

  const validateForm = useCallback(async (data: any): Promise<boolean> => {
    setState(prev => ({ ...prev, isValidating: true }));

    try {
      const result = validateData(data, schema);
      
      const errorMap: Record<string, string> = {};
      result.errors.forEach(error => {
        errorMap[error.field] = error.message;
      });

      setState(prev => ({
        ...prev,
        errors: errorMap,
        isValid: result.isValid,
        isValidating: false
      }));

      return result.isValid;
    } catch (error) {
      console.error('Validation error:', error);
      setState(prev => ({
        ...prev,
        isValidating: false,
        isValid: false
      }));
      return false;
    }
  }, [schema]);

  const validateSingleField = useCallback(async (fieldName: string, value: any): Promise<boolean> => {
    if (!schema[fieldName]) {
      return true;
    }

    setState(prev => ({ ...prev, isValidating: true }));

    try {
      const fieldError = validateField(value, fieldName, schema);
      
      setState(prev => {
        const newErrors = { ...prev.errors };
        
        if (fieldError) {
          newErrors[fieldName] = fieldError.message;
        } else {
          delete newErrors[fieldName];
        }

        return {
          ...prev,
          errors: newErrors,
          isValid: Object.keys(newErrors).length === 0,
          isValidating: false
        };
      });

      return !fieldError;
    } catch (error) {
      console.error('Field validation error:', error);
      setState(prev => ({
        ...prev,
        isValidating: false
      }));
      return false;
    }
  }, [schema]);

  const debouncedValidateField = useCallback((fieldName: string, value: any) => {
    if (debounceTimerRef) {
      clearTimeout(debounceTimerRef);
    }

    const timer = setTimeout(() => {
      validateSingleField(fieldName, value);
    }, debounceMs);

    // Store timer reference
    Object.assign(debounceTimerRef, timer);
  }, [validateSingleField, debounceMs, debounceTimerRef]);

  const validateFieldAction = useCallback(async (fieldName: string, value: any): Promise<boolean> => {
    if (validateOnChange) {
      if (debounceMs > 0) {
        debouncedValidateField(fieldName, value);
        return true; // Return true for debounced validation
      } else {
        return await validateSingleField(fieldName, value);
      }
    }
    return true;
  }, [validateOnChange, debounceMs, debouncedValidateField, validateSingleField]);

  const clearErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      errors: {},
      isValid: true
    }));
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[fieldName];
      
      return {
        ...prev,
        errors: newErrors,
        isValid: Object.keys(newErrors).length === 0
      };
    });
  }, []);

  const setFieldTouched = useCallback((fieldName: string) => {
    setState(prev => ({
      ...prev,
      touchedFields: new Set([...prev.touchedFields, fieldName])
    }));
  }, []);

  const resetValidation = useCallback(() => {
    setState({
      errors: {},
      isValid: true,
      isValidating: false,
      touchedFields: new Set()
    });
  }, []);

  const getFieldError = useCallback((fieldName: string): string | undefined => {
    return state.errors[fieldName];
  }, [state.errors]);

  const hasFieldError = useCallback((fieldName: string): boolean => {
    return fieldName in state.errors;
  }, [state.errors]);

  const isFieldTouched = useCallback((fieldName: string): boolean => {
    return state.touchedFields.has(fieldName);
  }, [state.touchedFields]);

  return {
    // State
    errors: state.errors,
    isValid: state.isValid,
    isValidating: state.isValidating,
    touchedFields: state.touchedFields,
    
    // Actions
    validateForm,
    validateField: validateFieldAction,
    clearErrors,
    clearFieldError,
    setFieldTouched,
    resetValidation,
    getFieldError,
    hasFieldError,
    isFieldTouched
  };
}

// Hook for validating a single field with real-time feedback
export function useFieldValidation(fieldName: string, schema: ValidationSchema, options?: {
  validateOnChange?: boolean;
  debounceMs?: number;
}) {
  const { validateOnChange = true, debounceMs = 300 } = options || {};
  
  const [error, setError] = useState<string | undefined>();
  const [isValidating, setIsValidating] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  const debounceTimerRef = useState<NodeJS.Timeout | null>(null)[0];

  useEffect(() => {
    return () => {
      if (debounceTimerRef) {
        clearTimeout(debounceTimerRef);
      }
    };
  }, [debounceTimerRef]);

  const validate = useCallback(async (value: any): Promise<boolean> => {
    if (!schema[fieldName]) {
      return true;
    }

    setIsValidating(true);

    try {
      const fieldError = validateField(value, fieldName, schema);
      setError(fieldError?.message);
      setIsValidating(false);
      return !fieldError;
    } catch (err) {
      console.error('Field validation error:', err);
      setIsValidating(false);
      return false;
    }
  }, [fieldName, schema]);

  const debouncedValidate = useCallback((value: any) => {
    if (debounceTimerRef) {
      clearTimeout(debounceTimerRef);
    }

    const timer = setTimeout(() => {
      validate(value);
    }, debounceMs);

    Object.assign(debounceTimerRef, timer);
  }, [validate, debounceMs, debounceTimerRef]);

  const onChange = useCallback((value: any) => {
    if (validateOnChange) {
      if (debounceMs > 0) {
        debouncedValidate(value);
      } else {
        validate(value);
      }
    }
  }, [validateOnChange, debounceMs, debouncedValidate, validate]);

  const onBlur = useCallback((value: any) => {
    setIsTouched(true);
    validate(value);
  }, [validate]);

  const clearError = useCallback(() => {
    setError(undefined);
  }, []);

  const reset = useCallback(() => {
    setError(undefined);
    setIsTouched(false);
    setIsValidating(false);
  }, []);

  return {
    error,
    isValidating,
    isTouched,
    hasError: !!error,
    validate,
    onChange,
    onBlur,
    clearError,
    reset
  };
}

// Hook for form submission with validation
export function useFormSubmission<T = any>({
  schema,
  onSubmit,
  validateOnSubmit = true
}: {
  schema: ValidationSchema;
  onSubmit: (data: T) => Promise<void> | void;
  validateOnSubmit?: boolean;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>();
  
  const validation = useValidation({ schema });

  const handleSubmit = useCallback(async (data: T) => {
    setIsSubmitting(true);
    setSubmitError(undefined);

    try {
      // Validate if required
      if (validateOnSubmit) {
        const isValid = await validation.validateForm(data);
        if (!isValid) {
          setIsSubmitting(false);
          return false;
        }
      }

      // Submit the form
      await onSubmit(data);
      setIsSubmitting(false);
      return true;
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError(error instanceof Error ? error.message : 'An error occurred');
      setIsSubmitting(false);
      return false;
    }
  }, [onSubmit, validateOnSubmit, validation]);

  const clearSubmitError = useCallback(() => {
    setSubmitError(undefined);
  }, []);

  return {
    ...validation,
    isSubmitting,
    submitError,
    handleSubmit,
    clearSubmitError
  };
}