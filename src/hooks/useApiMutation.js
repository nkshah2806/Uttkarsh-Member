// src/hooks/useApiMutation.js
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Generic reusable mutation hook with customizable behavior.
 * 
 * @param {Function} apiFn - The API function that returns a promise (e.g. axios call)
 * @param {Object} options - Optional callbacks and messages
 * @param {string} options.successMessage - Toast success message to show on success
 * @param {string} options.errorMessage - Toast error message to show on error
 * @param {Function} options.onSuccess - Callback on success (data, variables, context)
 * @param {Function} options.onError - Callback on error (error, variables, context)
 * @param {boolean} options.silentError - If true, suppress error toast
 */
export const useApiMutation = (
    apiFn,
    {
        successMessage,
        errorMessage,
        onSuccess,
        onError,
        silentError = false,
    } = {}
) => {
    return useMutation( {
        mutationFn: apiFn,
        onSuccess: (data, variables, context) => {
            if (successMessage) toast.success(successMessage);
            if (onSuccess) onSuccess(data, variables, context);
        },
        onError: (error, variables, context) => {
            if (!silentError) {
                if (errorMessage) {
                    toast.error(errorMessage);
                } else {
                    // Default error message from API or generic fallback
                    const msg =
                        error?.response?.data?.meta?.message ||
                        error?.message ||
                        'Something went wrong';
                    toast.error(msg);
                }
            }
            if (onError) onError(error, variables, context);
        },
    });
};
