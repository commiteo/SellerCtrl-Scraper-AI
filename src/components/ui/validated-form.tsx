/**
 * Validated Form Component
 * A comprehensive form wrapper with integrated validation
 */

import React, { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useValidation } from '@/hooks/useValidation';
import { ValidationSchema } from '@/lib/validation';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export interface ValidatedFormProps {
  children: React.ReactNode;
  schema: ValidationSchema;
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void> | void;
  onValidationChange?: (isValid: boolean, errors: Record<string, string>) => void;
  submitText?: string;
  resetText?: string;
  showResetButton?: boolean;
  disabled?: boolean;
  className?: string;
  cardWrapper?: boolean;
  title?: string;
  description?: string;
  validateOnMount?: boolean;
  showValidationSummary?: boolean;
}

export const ValidatedForm: React.FC<ValidatedFormProps> = ({
  children,
  schema,
  initialData = {},
  onSubmit,
  onValidationChange,
  submitText = "Submit",
  resetText = "Reset",
  showResetButton = false,
  disabled = false,
  className,
  cardWrapper = false,
  title,
  description,
  validateOnMount = false,
  showValidationSummary = true
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const validation = useValidation(schema, {
    validateOnMount,
    debounceMs: 300
  });

  // Update validation when form data changes
  useEffect(() => {
    validation.validateForm(formData);
  }, [formData]);

  // Notify parent of validation changes
  useEffect(() => {
    onValidationChange?.(validation.isValid, validation.errors);
  }, [validation.isValid, validation.errors, onValidationChange]);

  const updateField = useCallback((fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    validation.validateField(fieldName, value);
    setSubmitError(null);
    setSubmitSuccess(false);
  }, [validation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const isFormValid = validation.validateForm(formData);
    
    if (!isFormValid) {
      // Mark all fields as touched to show errors
      Object.keys(schema.fields).forEach(fieldName => {
        validation.setTouched(fieldName, true);
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      await onSubmit(formData);
      setSubmitSuccess(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred while submitting the form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(initialData);
    validation.reset();
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const getValidationSummary = () => {
    const errorCount = Object.keys(validation.errors).length;
    const totalFields = Object.keys(schema.fields).length;
    const validFields = totalFields - errorCount;
    
    return {
      errorCount,
      totalFields,
      validFields,
      hasErrors: errorCount > 0
    };
  };

  const summary = getValidationSummary();

  const formContent = (
    <>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      
      <CardContent className={cn(!cardWrapper && "p-0")}>
        {showValidationSummary && summary.totalFields > 0 && (
          <div className="mb-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {summary.hasErrors ? (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
                <span className="text-sm font-medium">
                  Form Validation Status
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {summary.validFields}/{summary.totalFields} fields valid
              </div>
            </div>
            
            {summary.hasErrors && (
              <div className="mt-2">
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(summary.validFields / summary.totalFields) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary.errorCount} field{summary.errorCount !== 1 ? 's' : ''} need{summary.errorCount === 1 ? 's' : ''} attention
                </p>
              </div>
            )}
          </div>
        )}
        
        {submitError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}
        
        {submitSuccess && (
          <Alert className="mb-6 border-green-500 text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>Form submitted successfully!</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child) && child.props.fieldName) {
              return React.cloneElement(child as React.ReactElement<any>, {
                value: formData[child.props.fieldName] || '',
                onChange: (value: any) => updateField(child.props.fieldName, value),
                schema: schema,
                ...child.props
              });
            }
            return child;
          })}
          
          <div className="flex justify-between items-center pt-4">
            <div className="flex space-x-2">
              {showResetButton && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={disabled || isSubmitting}
                >
                  {resetText}
                </Button>
              )}
            </div>
            
            <Button
              type="submit"
              disabled={disabled || isSubmitting || !validation.isValid}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                submitText
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </>
  );

  if (cardWrapper) {
    return (
      <Card className={className}>
        {formContent}
      </Card>
    );
  }

  return (
    <div className={className}>
      {formContent}
    </div>
  );
};

// Form Field Wrapper for custom validation
export interface FormFieldProps {
  children: React.ReactNode;
  fieldName: string;
  schema: ValidationSchema;
  value: any;
  onChange: (value: any) => void;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  children,
  fieldName,
  schema,
  value,
  onChange,
  className
}) => {
  const validation = useValidation(schema);
  
  const handleChange = (newValue: any) => {
    onChange(newValue);
    validation.validateField(fieldName, newValue);
  };

  return (
    <div className={className}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            value,
            onChange: handleChange,
            error: validation.errors[fieldName],
            isValid: !validation.errors[fieldName] && validation.touched[fieldName],
            ...child.props
          });
        }
        return child;
      })}
    </div>
  );
};

// Multi-step form support
export interface MultiStepFormProps {
  steps: {
    title: string;
    description?: string;
    schema: ValidationSchema;
    component: React.ComponentType<any>;
  }[];
  onComplete: (data: Record<string, any>) => Promise<void> | void;
  className?: string;
}

export const MultiStepForm: React.FC<MultiStepFormProps> = ({
  steps,
  onComplete,
  className
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  
  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleStepSubmit = async (stepData: Record<string, any>) => {
    const updatedData = { ...formData, ...stepData };
    setFormData(updatedData);
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    
    if (isLastStep) {
      await onComplete(updatedData);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex <= currentStep || completedSteps.has(stepIndex - 1)) {
      setCurrentStep(stepIndex);
    }
  };

  const goToPreviousStep = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className={className}>
      {/* Step indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <button
                onClick={() => goToStep(index)}
                disabled={index > currentStep && !completedSteps.has(index - 1)}
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors",
                  index === currentStep && "bg-primary text-primary-foreground",
                  index < currentStep && "bg-green-500 text-white",
                  index > currentStep && "bg-muted text-muted-foreground",
                  (index <= currentStep || completedSteps.has(index - 1)) && "cursor-pointer hover:opacity-80",
                  index > currentStep && !completedSteps.has(index - 1) && "cursor-not-allowed"
                )}
              >
                {completedSteps.has(index) ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </button>
              
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-12 h-0.5 mx-2",
                  index < currentStep ? "bg-green-500" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4">
          <h3 className="text-lg font-semibold">{currentStepData.title}</h3>
          {currentStepData.description && (
            <p className="text-muted-foreground">{currentStepData.description}</p>
          )}
        </div>
      </div>
      
      {/* Current step form */}
      <ValidatedForm
        schema={currentStepData.schema}
        initialData={formData}
        onSubmit={handleStepSubmit}
        submitText={isLastStep ? "Complete" : "Next"}
        showResetButton={false}
      >
        <currentStepData.component data={formData} />
      </ValidatedForm>
      
      {/* Navigation */}
      {!isFirstStep && (
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={goToPreviousStep}
          >
            Previous
          </Button>
        </div>
      )}
    </div>
  );
};