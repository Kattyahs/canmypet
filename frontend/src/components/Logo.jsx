//import logo from '../assets/canmypet-horizontal-turquesa.svg'
import logo from '../assets/CanMyPet_Recuadro_Verde_Tipografia_Suave.svg'
function Logo({ className = 'h-9' }) {
    return <img src={logo} alt="CanMyPet?" className={`${className} w-auto`} />
}

export default Logo