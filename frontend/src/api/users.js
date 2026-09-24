import axiosClient from './axiosClient'

export const getUsers = (params) => axiosClient.get('/api/users', { params })

export const verifyUser = (id) => axiosClient.put(`/api/users/${id}/verify`)