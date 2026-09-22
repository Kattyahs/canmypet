function EmptyState({ icon: Icon, title, description, children }) {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            {Icon && (
                <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-bone flex items-center justify-center">
                    <Icon size={20} className="text-gray-400" aria-hidden="true" />
                </div>
            )}
            <p className="font-medium text-gray-900">{title}</p>
            {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
            {children && <div className="mt-4">{children}</div>}
        </div>
    )
}

export default EmptyState