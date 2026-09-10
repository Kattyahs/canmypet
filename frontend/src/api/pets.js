import axiosClient from './axiosClient'

export const getMyPets = () => axiosClient.get('/api/pets')

export const createPet = (data) => axiosClient.post('/api/pets', data)

export const updatePet = (id, data) => axiosClient.put(`/api/pets/${id}`, data)

export const deletePet = (id) => axiosClient.delete(`/api/pets/${id}`)