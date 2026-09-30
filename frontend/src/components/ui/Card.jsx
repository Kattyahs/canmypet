function Card({ as: Tag = 'div', padded = true, className = '', children, ...props }) {
    return (
        <Tag
            className={`bg-white border border-gray-100 rounded-2xl shadow-card ${padded ? 'p-4 md:p-5' : ''} ${className}`}
            {...props}
        >
            {children}
        </Tag>
    )
}

export default Card