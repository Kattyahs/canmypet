import axiosClient from "./axiosClient.js";

export const recordSearch = (data) => axiosClient.post('/api/search-history', data)

export const getMyHistory = (params) => axiosClient.get('/api/search-history/me', { params })