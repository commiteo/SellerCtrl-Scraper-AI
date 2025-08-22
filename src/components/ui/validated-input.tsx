/**
 * Validated Input Components
 * Pre-built input components with integrated validation
 */

import React, { forwardRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useFieldValidation } from '@/hooks/useValidation';
import { ValidationSchema } from '@/lib/validation';
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export interface ValidatedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  fieldName: string;
  schema: ValidationSchema;
  value: string;
  onChange: (value: string) => void;
  showValidationIcon?: boolean;
  validateOnChange?: boolean;
  debounceMs?: number;
  helperText?: string;
  required?: boolean;
}

export const ValidatedInput = forwardRef<HTMLInputElement, ValidatedInputProps>(
  ({
    label,
    fieldName,
    schema,
    value,
    onChange,
    showValidationIcon = true,
    validateOnChange = true,
    debounceMs = 300,
    helperText,
    required,
    className,
    ...props
  }, ref) => {
    const validation = useFieldValidation(fieldName, schema, {
      validateOnChange,
      debounceMs
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      onChange(newValue);
      validation.onChange(newValue);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      validation.onBlur(value);
      props.onBlur?.(e);
    };

    const hasError = validation.hasError && validation.isTouched;
    const isValid = !validation.hasError && validation.isTouched && value.length > 0;

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={fieldName} className={cn(hasError && "text-destructive")}>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        
        <div className="relative">
          <Input
            ref={ref}
            id={fieldName}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            className={cn(
              hasError && "border-destructive focus-visible:ring-destructive",
              isValid && "border-green-500 focus-visible:ring-green-500",
              showValidationIcon && "pr-10",
              className
            )}
            aria-invalid={hasError}
            aria-describedby={`${fieldName}-error ${fieldName}-helper`}
            {...props}
          />
          
          {showValidationIcon && validation.isTouched && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {validation.isValidating ? (
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              ) : hasError ? (
                <AlertCircle className="h-4 w-4 text-destructive" />
              ) : isValid ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : null}
            </div>
          )}
        </div>
        
        {hasError && (
          <p id={`${fieldName}-error`} className="text-sm text-destructive">
            {validation.error}
          </p>
        )}
        
        {helperText && !hasError && (
          <p id={`${fieldName}-helper`} className="text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

ValidatedInput.displayName = "ValidatedInput";

// Password Input with show/hide functionality
export interface ValidatedPasswordInputProps extends Omit<ValidatedInputProps, 'type'> {
  showStrengthIndicator?: boolean;
}

export const ValidatedPasswordInput = forwardRef<HTMLInputElement, ValidatedPasswordInputProps>(
  ({ showStrengthIndicator = true, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    
    const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
      if (password.length === 0) return { score: 0, label: '', color: '' };
      
      let score = 0;
      if (password.length >= 8) score++;
      if (/[A-Z]/.test(password)) score++;
      if (/[a-z]/.test(password)) score++;
      if (/\d/.test(password)) score++;
      if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
      
      const levels = [
        { score: 1, label: 'Very Weak', color: 'bg-red-500' },
        { score: 2, label: 'Weak', color: 'bg-orange-500' },
        { score: 3, label: 'Fair', color: 'bg-yellow-500' },
        { score: 4, label: 'Good', color: 'bg-blue-500' },
        { score: 5, label: 'Strong', color: 'bg-green-500' }
      ];
      
      return levels.find(level => level.score === score) || levels[0];
    };
    
    const strength = getPasswordStrength(props.value);
    
    return (
      <div className="space-y-2">
        <div className="relative">
          <ValidatedInput
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            {...props}
            className={cn('pr-20', props.className)}
          />
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-8 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {showStrengthIndicator && props.value.length > 0 && (
          <div className="space-y-1">
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={cn(
                    'h-2 flex-1 rounded-full transition-colors',
                    level <= strength.score ? strength.color : 'bg-muted'
                  )}
                />
              ))}
            </div>
            {strength.label && (
              <p className="text-xs text-muted-foreground">
                Password strength: <span className={cn(
                  'font-medium',
                  strength.score <= 2 && 'text-destructive',
                  strength.score === 3 && 'text-yellow-600',
                  strength.score >= 4 && 'text-green-600'
                )}>
                  {strength.label}
                </span>
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

ValidatedPasswordInput.displayName = "ValidatedPasswordInput";

// Textarea with validation
export interface ValidatedTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  label?: string;
  fieldName: string;
  schema: ValidationSchema;
  value: string;
  onChange: (value: string) => void;
  showValidationIcon?: boolean;
  validateOnChange?: boolean;
  debounceMs?: number;
  helperText?: string;
  required?: boolean;
  showCharacterCount?: boolean;
  maxLength?: number;
}

export const ValidatedTextarea = forwardRef<HTMLTextAreaElement, ValidatedTextareaProps>(
  ({
    label,
    fieldName,
    schema,
    value,
    onChange,
    showValidationIcon = true,
    validateOnChange = true,
    debounceMs = 300,
    helperText,
    required,
    showCharacterCount = false,
    maxLength,
    className,
    ...props
  }, ref) => {
    const validation = useFieldValidation(fieldName, schema, {
      validateOnChange,
      debounceMs
    });

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      onChange(newValue);
      validation.onChange(newValue);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      validation.onBlur(value);
      props.onBlur?.(e);
    };

    const hasError = validation.hasError && validation.isTouched;
    const isValid = !validation.hasError && validation.isTouched && value.length > 0;

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={fieldName} className={cn(hasError && "text-destructive")}>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        
        <div className="relative">
          <Textarea
            ref={ref}
            id={fieldName}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            maxLength={maxLength}
            className={cn(
              hasError && "border-destructive focus-visible:ring-destructive",
              isValid && "border-green-500 focus-visible:ring-green-500",
              className
            )}
            aria-invalid={hasError}
            aria-describedby={`${fieldName}-error ${fieldName}-helper`}
            {...props}
          />
          
          {showValidationIcon && validation.isTouched && (
            <div className="absolute right-3 top-3">
              {validation.isValidating ? (
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              ) : hasError ? (
                <AlertCircle className="h-4 w-4 text-destructive" />
              ) : isValid ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : null}
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {hasError && (
              <p id={`${fieldName}-error`} className="text-sm text-destructive">
                {validation.error}
              </p>
            )}
            
            {helperText && !hasError && (
              <p id={`${fieldName}-helper`} className="text-sm text-muted-foreground">
                {helperText}
              </p>
            )}
          </div>
          
          {showCharacterCount && maxLength && (
            <p className={cn(
              "text-xs text-muted-foreground ml-2",
              value.length > maxLength * 0.9 && "text-yellow-600",
              value.length >= maxLength && "text-destructive"
            )}>
              {value.length}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

ValidatedTextarea.displayName = "ValidatedTextarea";

// Select with validation
export interface ValidatedSelectProps {
  label?: string;
  fieldName: string;
  schema: ValidationSchema;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
}

export const ValidatedSelect: React.FC<ValidatedSelectProps> = ({
  label,
  fieldName,
  schema,
  value,
  onChange,
  options,
  placeholder = "Select an option...",
  helperText,
  required,
  className
}) => {
  const validation = useFieldValidation(fieldName, schema);
  const [isTouched, setIsTouched] = useState(false);

  const handleValueChange = (newValue: string) => {
    onChange(newValue);
    validation.onChange(newValue);
    if (!isTouched) setIsTouched(true);
  };

  const hasError = validation.hasError && isTouched;

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={fieldName} className={cn(hasError && "text-destructive")}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      <Select value={value} onValueChange={handleValueChange}>
        <SelectTrigger
          className={cn(
            hasError && "border-destructive focus:ring-destructive",
            className
          )}
          aria-invalid={hasError}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {hasError && (
        <p className="text-sm text-destructive">
          {validation.error}
        </p>
      )}
      
      {helperText && !hasError && (
        <p className="text-sm text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
};

// Checkbox with validation
export interface ValidatedCheckboxProps {
  label: string;
  fieldName: string;
  schema: ValidationSchema;
  checked: boolean;
  onChange: (checked: boolean) => void;
  helperText?: string;
  required?: boolean;
  className?: string;
}

export const ValidatedCheckbox: React.FC<ValidatedCheckboxProps> = ({
  label,
  fieldName,
  schema,
  checked,
  onChange,
  helperText,
  required,
  className
}) => {
  const validation = useFieldValidation(fieldName, schema);
  const [isTouched, setIsTouched] = useState(false);

  const handleCheckedChange = (newChecked: boolean) => {
    onChange(newChecked);
    validation.onChange(newChecked);
    if (!isTouched) setIsTouched(true);
  };

  const hasError = validation.hasError && isTouched;

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={fieldName}
          checked={checked}
          onCheckedChange={handleCheckedChange}
          className={cn(
            hasError && "border-destructive",
            className
          )}
          aria-invalid={hasError}
        />
        <Label
          htmlFor={fieldName}
          className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            hasError && "text-destructive"
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      </div>
      
      {hasError && (
        <p className="text-sm text-destructive">
          {validation.error}
        </p>
      )}
      
      {helperText && !hasError && (
        <p className="text-sm text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
};