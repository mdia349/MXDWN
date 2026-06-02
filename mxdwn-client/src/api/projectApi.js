import apiClient from "./axiosClient.js";


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
}