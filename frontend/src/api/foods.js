import axiosClient from './axiosClient'

export const searchFoods = (query) =>
    axiosClient.get('/api/foods/search', { params: { query } })

export const getAllFoods = (params) => axiosClient.get('/api/foods', { params })

export const getFoodsByIds = (ids) =>
    axiosClient.get('/api/foods/by-ids', { params: { ids: ids.join(',') } })

export const getFoodSafety = (foodId, species, lifeStage) =>
    axiosClient.get(`/api/food-safety/${foodId}/${species}`, {
        params: lifeStage ? { lifeStage } : {},
    })
export const getFoodSafetyAllSpecies = (foodId) =>
    axiosClient.get(`/api/food-safety/${foodId}`)

export const getFoodSafetyByStatus = (status) =>
    axiosClient.get('/api/food-safety', { params: { status } })

export const verifyFoodSafety = (id) => axiosClient.put(`/api/food-safety/${id}/verify`)

export const createFoodSafety = (data) => axiosClient.post('/api/food-safety', data)