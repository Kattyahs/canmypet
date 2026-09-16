import axiosClient from './axiosClient'

export const getEmergencyGuide = (riskLevel) =>
    axiosClient.get(`/api/emergency/${riskLevel}`)