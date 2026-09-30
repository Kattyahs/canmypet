import { describe, it, expect } from 'vitest'
import { getFoodImageUrl } from './foodImages'
import { getFoodCategoryLabel } from '../constants/foodCategories'

describe('getFoodImageUrl', () => {
    it('finds the TheMealDB ingredient ignoring case and accents', () => {
        expect(getFoodImageUrl('Plátano')).toBe('https://www.themealdb.com/images/ingredients/Banana.png')
        expect(getFoodImageUrl('MANÍ SIN SAL')).toBe('https://www.themealdb.com/images/ingredients/Peanuts.png')
    })

    it('uses the small version for thumbnails and encodes spaces', () => {
        expect(getFoodImageUrl('Chocolate', { small: true })).toBe(
            'https://www.themealdb.com/images/ingredients/Dark%20Chocolate-Small.png'
        )
    })

    it('returns nothing for foods without an image, so the category icon is shown', () => {
        expect(getFoodImageUrl('Xilitol')).toBeNull()
        expect(getFoodImageUrl(undefined)).toBeNull()
    })
})

describe('getFoodCategoryLabel', () => {
    it('translates the stored category and keeps unknown ones as they are', () => {
        expect(getFoodCategoryLabel('sweets')).toBe('Dulce')
        expect(getFoodCategoryLabel('Legumbres')).toBe('Legumbres')
    })
})