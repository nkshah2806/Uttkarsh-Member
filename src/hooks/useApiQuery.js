// src/hooks/useApiQuery.js
import { useQuery } from '@tanstack/react-query';


export const useApiQuery = ({ queryKey, queryFn, ...options }) => {
    return useQuery({
        queryKey,
        queryFn,
        ...options,
    });
};
  
