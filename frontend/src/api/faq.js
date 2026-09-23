import axiosClient from './axiosClient'

export const getFaqs = (params) => axiosClient.get('/api/faq', { params })

export const getAllFaqs = getFaqs

export const askQuestion = (data) => axiosClient.post('/api/faq', data)

export const answerQuestion = (id, data) => axiosClient.put(`/api/faq/${id}/answer`, data)