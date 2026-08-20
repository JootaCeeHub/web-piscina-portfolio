import { useState } from 'react';
import { useForm } from '@formspree/react';
import { useApp, generateId, trackEvent } from '../context/AppContext';

interface UseFormspreeProps {
  formId: string;
  formType: 'contact' | 'quote' | 'visit';
}

export const useFormspree = ({ formId, formType }: UseFormspreeProps) => {
  const [state, handleSubmit] = useForm(formId);
  const { dispatch } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitForm = async (data: any) => {
    setIsSubmitting(true);
    
    const submissionId = generateId();
    
    // Add to context
    dispatch({
      type: 'ADD_FORM_SUBMISSION',
      payload: {
        id: submissionId,
        type: formType,
        data,
        timestamp: new Date(),
        status: 'pending'
      }
    });

    try {
      await handleSubmit(data);
      
      // Update status to sent
      dispatch({
        type: 'UPDATE_FORM_STATUS',
        payload: { id: submissionId, status: 'sent' }
      });

      // Track analytics
      trackEvent('form_submit', {
        form_type: formType,
        form_id: formId
      });

      dispatch({
        type: 'TRACK_INTERACTION',
        payload: `form_submit_${formType}`
      });

    } catch (error) {
      // Update status to error
      dispatch({
        type: 'UPDATE_FORM_STATUS',
        payload: { id: submissionId, status: 'error' }
      });

      trackEvent('form_error', {
        form_type: formType,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    state,
    submitForm,
    isSubmitting: isSubmitting || state.submitting,
    succeeded: state.succeeded,
    errors: state.errors
  };
};