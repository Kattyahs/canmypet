import axiosClient from './axiosClient'

export const getMyPets = () => axiosClient.get('/api/pets')

export const createPet = (data) => axiosClient.post('/api/pets', data)

export const updatePet = (id, data) => axiosClient.put(`/api/pets/${id}`, data)

export const deletePet = (id) => axiosClient.delete(`/api/pets/${id}`)

export const uploadPetPhoto = (id, photo) => {
    const body = new FormData()
    body.append('file', photo, 'photo.jpg')
    return axiosClient.put(`/api/pets/${id}/photo`, body, { headers: { 'Content-Type': 'multipart/form-data' } })
}

export const getPetPhoto = (id) => axiosClient.get(`/api/pets/${id}/photo`, { responseType: 'blob' })

export const deletePetPhoto = (id) => axiosClient.delete(`/api/pets/${id}/photo`)