import { Apple, Candy, Carrot, Cookie, CupSoda, Drumstick, Fish, Milk, Nut, Sprout, Utensils, Wheat } from 'lucide-react'

export const FOOD_CATEGORIES = {
    fruit: { label: 'Fruta', Icon: Apple },
    vegetable: { label: 'Verdura', Icon: Carrot },
    meat: { label: 'Carne', Icon: Drumstick },
    fish: { label: 'Pescado y mariscos', Icon: Fish },
    dairy: { label: 'Lácteo', Icon: Milk },
    sweets: { label: 'Dulce', Icon: Candy },
    snack: { label: 'Snack', Icon: Cookie },
    drink: { label: 'Bebida', Icon: CupSoda },
    nuts: { label: 'Fruto seco', Icon: Nut },
    grain: { label: 'Cereal', Icon: Wheat },
    spice: { label: 'Especia', Icon: Sprout },
}

const DEFAULT_CATEGORY = { label: null, Icon: Utensils }

export const getFoodCategory = (category) => FOOD_CATEGORIES[category?.toLowerCase?.()] ?? DEFAULT_CATEGORY

export const getFoodCategoryLabel = (category) => getFoodCategory(category).label ?? category ?? ''