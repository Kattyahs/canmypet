import axiosClient from './axiosClient'

export const getAllFaqs = () => axiosClient.get('/api/faq')

export const askQuestion = (data) => axiosClient.post('/api/faq', data)

export const answerQuestion = (id, data) => axiosClient.put(`/api/faq/${id}/answer`, data)