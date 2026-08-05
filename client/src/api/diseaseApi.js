import api from './apiClient';

export const detectDisease = (formData) => {
    return api.post('/api/disease/detect', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};
