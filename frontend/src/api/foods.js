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

export const getFoodSafetyByStatus = (params) => axiosClient.get('/api/food-safety', { params })

export const verifyFoodSafety = (id) => axiosClient.put(`/api/food-safety/${id}/verify`)

export const createFoodSafety = (data) => axiosClient.post('/api/food-safety', data)

export const createFood = (data) => axiosClient.post('/api/foods', data)

export const updateFood = (id, data) => axiosClient.put(`/api/foods/${id}`, data)