import { useState } from 'react'
import { getFoodCategory } from '../constants/foodCategories'
import { getFoodImageUrl } from '../utils/foodImages'

const SIZES = {
    sm: { box: 'w-9 h-9 rounded-md', icon: 18, small: true },
    md: { box: 'w-12 h-12 rounded-lg', icon: 22, small: true },
    lg: { box: 'w-20 h-20 rounded-xl', icon: 34, small: false },
}

function FoodThumb({ name, category, size = 'sm', className = '' }) {
    const { box, icon, small } = SIZES[size] ?? SIZES.sm
    const imageUrl = getFoodImageUrl(name, { small })
    const [failedUrl, setFailedUrl] = useState(null)
    const { Icon } = getFoodCategory(category)
    const showImage = imageUrl && failedUrl !== imageUrl

    return (
        <span
            aria-hidden="true"
            className={`shrink-0 inline-flex items-center justify-center overflow-hidden bg-white border border-gray-200 ${box} ${className}`}
        >
            {showImage ? (
                <img
                    src={imageUrl}
                    alt=""
                    loading="lazy"
                    onError={() => setFailedUrl(imageUrl)}
                    className="w-full h-full object-contain p-1"
                />
            ) : (
                <Icon size={icon} className="text-brand" />
            )}
        </span>
    )
}

export default FoodThumb