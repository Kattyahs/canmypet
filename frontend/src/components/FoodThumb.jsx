import { useState } from 'react'
import { getFoodCategory } from '../constants/foodCategories'
import { getFoodImageUrl } from '../utils/foodImages'

const FRAMED = 'bg-white border border-gray-200'

const SIZES = {
    sm: { box: `w-9 h-9 rounded-md ${FRAMED}`, icon: 18, small: true, padding: 'p-1' },
    md: { box: `w-12 h-12 rounded-lg ${FRAMED}`, icon: 22, small: true, padding: 'p-1' },
    lg: { box: `w-20 h-20 rounded-xl ${FRAMED}`, icon: 34, small: false, padding: 'p-1' },
    xl: { box: 'w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-2xl bg-white/80', icon: 48, small: false, padding: 'p-3' },
    cover: { box: 'w-full h-28 rounded-xl bg-bone', icon: 40, small: false, padding: 'p-3' },
}

function FoodThumb({ name, category, size = 'sm', className = '' }) {
    const { box, icon, small, padding } = SIZES[size] ?? SIZES.sm
    const imageUrl = getFoodImageUrl(name, { small })
    const [failedUrl, setFailedUrl] = useState(null)
    const { Icon } = getFoodCategory(category)
    const showImage = imageUrl && failedUrl !== imageUrl

    return (
        <span aria-hidden="true" className={`shrink-0 inline-flex items-center justify-center overflow-hidden ${box} ${className}`}>
            {showImage ? (
                <img
                    src={imageUrl}
                    alt=""
                    loading="lazy"
                    onError={() => setFailedUrl(imageUrl)}
                    className={`w-full h-full object-contain ${padding}`}
                />
            ) : (
                <Icon size={icon} className="text-brand" />
            )}
        </span>
    )
}

export default FoodThumb