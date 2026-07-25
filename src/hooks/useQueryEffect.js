// src/hooks/useQueryEffect.js
import { useEffect } from 'react';

/**
 * Hook to handle side effects after React Query results.
 * 
 * @param {Object} params
 * @param {any} params.data - The data returned by the query
 * @param {boolean} params.isError - Boolean flag if there's an error
 * @param {any} params.error - The error object
 * @param {Function} [params.onSuccess] - Function to run when data is available
 * @param {Function} [params.onError] - Function to run when there's an error
 */
export const useQueryEffect = ({ data, isError, error, onSuccess, onError }) => {
    useEffect(() => {
        if (data && onSuccess) {
            onSuccess(data);
        }
    }, [data, onSuccess]);

    useEffect(() => {
        if (isError && error && onError) {
            onError(error);
        }
    }, [isError, error, onError]);
};
