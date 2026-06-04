import apiClient from "./axiosClient.js";
import axios from "axios";


export const fetchProjects = async (artistId) => {
    const response = await apiClient.get(`/projects?artistId=${artistId}`);
    return response.data;
};

export const createProject = async (projectData) => {
    const response = await apiClient.post('/projects', projectData);
    return response.data;
};

export const fetchProjectMixes = async (projectId) => {
    const response = await apiClient.get(`/projects/${projectId}/mixes`);
    return response.data;
};

export const createMix = async (projectId, mixData) => {
    const response = await apiClient.post(`/projects/${projectId}/mixes`, mixData);
    return response.data;
};

export const uploadFileToS3 = async (uploadUrl, file, onProgress) => {
    await axios.put(uploadUrl, file, {
        headers: {
            'Content-Type': file.type
        },
        onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            if (onProgress) onProgress(percentCompleted);
        }
    });
};