import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const INPUT =
    'w-full min-h-[48px] pl-11 border border-gray-200 rounded-xl text-base md:text-sm bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent'

function AuthField({ id, label, icon: Icon, type = 'text', hint, ...inputProps }) {
    const [visible, setVisible] = useState(false)
    const isPassword = type === 'password'

    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
                {label}
            </label>
            <div className="relative">
                <Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                <input
                    id={id}
                    type={isPassword && visible ? 'text' : type}
                    className={`${INPUT} ${isPassword ? 'pr-12' : 'pr-4'}`}
                    {...inputProps}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setVisible((prev) => !prev)}
                        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        aria-pressed={visible}
                        className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    >
                        {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                    </button>
                )}
            </div>
            {hint && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
        </div>
    )
}

export default AuthField