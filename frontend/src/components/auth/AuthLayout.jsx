import petsPhoto from '../../assets/login-mascotas.jpg'
import Logo from '../Logo'

function AuthLayout({ title, subtitle, children, footer }) {
    return (
        <div className="min-h-screen md:h-screen bg-bone flex items-center justify-center md:p-6">
            <div className="w-full min-h-screen md:min-h-0 md:h-full md:max-h-[760px] md:max-w-5xl grid content-start md:content-stretch md:grid-cols-2 bg-white md:rounded-3xl md:shadow-raised overflow-hidden">
                <div className="hidden md:flex flex-col min-h-0 bg-[#C8DED2]">
                    <div className="shrink-0 px-10 pt-10 text-center">
                        <p className="text-4xl font-bold leading-tight text-gray-900">Cuida lo que comen</p>
                        <p className="mt-3 mx-auto max-w-xs text-base text-gray-700 [@media(max-height:760px)]:hidden">
                            Información confiable, revisada por veterinarios, para una vida más sana y feliz junto a tu
                            mascota.
                        </p>
                    </div>
                    <img src={petsPhoto} alt="" className="flex-1 min-h-0 w-full object-cover object-bottom [mask-image:linear-gradient(to_bottom,transparent,black_6%)]" />
                </div>

                <div className="md:hidden h-48 overflow-hidden bg-[#C8DED2]">
                    <img src={petsPhoto} alt="" className="w-full h-full object-cover object-[center_35%]" />
                </div>

                <div className="flex flex-col md:min-h-0 md:overflow-y-auto px-6 py-8 sm:px-10 md:px-12 md:py-8">
                    <div className="w-full max-w-sm m-auto">
                        <Logo className="h-9 mb-6" />
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
                        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
                        <div className="mt-6">{children}</div>
                        {footer && <div className="mt-6 text-center text-sm text-gray-500">{footer}</div>}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuthLayout