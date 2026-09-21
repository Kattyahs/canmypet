import axiosClient from './axiosClient'

export const searchFoods = (query) =>
    axiosClient.get('/api/foods/search', { params: { query } })

export const getAllFoods = () => axiosClient.get('/api/foods')

export const getFoodSafety = (foodId, species, lifeStage) =>
    axiosClient.get(`/api/food-safety/${foodId}/${species}`, {
        params: lifeStage ? { lifeStage } : {},
    })
export const getFoodSafetyAllSpecies = (foodId) =>
    axiosClient.get(`/api/food-safety/${foodId}`)