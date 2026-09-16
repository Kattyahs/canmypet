import axiosClient from "./axiosClient.js";

export const recordSearch = (data) => axiosClient.post('/api/search-history', data)

export const getMyHistory = () => axiosClient.get('/api/search-history/me')