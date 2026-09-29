import logo from '../assets/canmypet-horizontal-turquesa.svg'

function Logo({ className = 'h-9' }) {
    return <img src={logo} alt="CanMyPet?" className={`${className} w-auto`} />
}

export default Logo