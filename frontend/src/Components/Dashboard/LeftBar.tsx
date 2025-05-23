import logo from '../../assets/logo.png'
import { LiaAwardSolid } from 'react-icons/lia'
import { TfiHelpAlt } from 'react-icons/tfi'
import { Link } from 'react-router'

const LeftBar = () => {
    return (
        <div className='bg-[#171022] w-20  p-4 lg:block hidden'>
            <img src={logo} alt="logo" className='rounded-lg' />
            <Link to={"/events"} className="flex mt-10 items-center justify-center flex-col  text-zinc-500 duration-500 transition-all hover:text-white cursor-pointer">
                <LiaAwardSolid className='text-3xl' />
                <p className='text-sm NekstMedium'>Events</p>
            </Link>
            <Link to={"/help"} className="flex mt-8 items-center justify-center flex-col  text-zinc-500 duration-500 transition-all hover:text-white cursor-pointer">
                <TfiHelpAlt className='text-2xl mb-1' />
                <p className='text-sm NekstMedium'>Help</p>
            </Link>
        </div>
    )
}

export default LeftBar