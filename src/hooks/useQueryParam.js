// src/hooks/useQueryParams.js:
import { useLocation } from 'react-router-dom';

const useQueryParam = (key) => {
    const { search } = useLocation();
    const queryParams = new URLSearchParams(search);
    return queryParams.get(key);
};

export default useQueryParam;


// // useQueryParams – All Parameters as Object

// import { useLocation } from 'react-router-dom';

// const useQueryParams = () => {
//     const { search } = useLocation();
//     const queryParams = new URLSearchParams(search);

//     const params = {};
//     for (let [key, value] of queryParams.entries()) {
//         params[key] = value;
//     }

//     return params;
// };

// export default useQueryParams;