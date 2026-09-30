const VARIANTS = {
    primary: 'bg-brand text-white hover:bg-brand-dark',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    outline: 'bg-white border border-brand text-brand hover:bg-brand-muted',
    ghost: 'text-brand hover:bg-brand-muted',
    danger: 'bg-risk-toxic text-white hover:opacity-90',
}

const SIZES = {
    md: 'min-h-[44px] px-4 text-sm',
    lg: 'min-h-[48px] px-5 text-base',
}

export const buttonClasses = ({ variant = 'primary', size = 'md', fullWidth = false, className = '' } = {}) =>
    `inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? 'w-full' : ''} ${className}`

function Button({ variant, size, fullWidth, className, type = 'button', children, ...props }) {
    return (
        <button type={type} className={buttonClasses({ variant, size, fullWidth, className })} {...props}>
            {children}
        </button>
    )
}

export default Button