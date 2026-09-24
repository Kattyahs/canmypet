import axiosClient from './axiosClient'

export const getEmergencyGuide = (riskLevel) =>
    axiosClient.get(`/api/emergency/${riskLevel}`)

export const saveEmergencyGuide = (data) => axiosClient.post('/api/emergency', data)