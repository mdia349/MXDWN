import apiClient from "./axiosClient.js";


export const fetchMixComments = async (mixId) => {
    const response = await apiClient.get(`/mixes/${mixId}/comments`);
    return response.data;
}

export const createComment = async (mixId, commentData) => {
    const response = await apiClient.post(`/mixes/${mixId}/comments`, commentData);
    return response.data;
}