import { Link, NavLink } from "react-router"
import logo from '../assets/logo.png'
import { IoIosArrowDown } from "react-icons/io";
import { FaArrowRightLong } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useTranslation } from "react-i18next";

const Navbar = () => {
    const [navbar, setNavbar] = useState(false)
    const [isOpenLanguageDropDown, setIsOpenLanguageDropDown] = useState(false)

    const { t, i18n } = useTranslation();

    const storedLanguage = localStorage.getItem("i18nextLng") || "en";

    const changeLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
    }

    const english = () => {
        changeLanguage('en')
        setIsOpenLanguageDropDown(false)
    }

    const urdu = () => {
        changeLanguage('ur')
        setIsOpenLanguageDropDown(false)
    }

    useEffect(() => {
        document.body.dir = i18n.dir();
    }, [i18n, i18n.language])

    return (
        <>
            <div className="bg-black text-white h-[5.5rem]">
                <div className="max-w-7xl w-full mx-auto p-5 flex items-center justify-between">

                    <Link to={"/"} className="flex items-center gap-3">
                        <img src={logo} alt="logo" className="h-10 rounded-lg" />
                        <h2 className="text-lg md:block hidden font-semibold leading-tight">Wealth <br /> Way Trade</h2>
                    </Link>


                    {/* <ul className="lg:flex hidden gap-10">
                        <li><NavLink to={"/"}>Home</NavLink></li>
                        <li><NavLink to={"/about"}>About Us</NavLink></li>
                        <li><NavLink to={"/partner"}>Partners</NavLink></li>
                        <li><NavLink to={"/faq"}>Faqs</NavLink></li>
                    </ul> */}

                    <div className="flex items-center z-10 md:gap-10 gap-4">
                        <div className="relative">
                            <div onClick={() => setIsOpenLanguageDropDown(!isOpenLanguageDropDown)} className="flex font-medium md:text-lg cursor-pointer items-center gap-2">
                                <p>{storedLanguage}</p>
                                <IoIosArrowDown />
                            </div>

                            {
                                isOpenLanguageDropDown && (
                                    <div className="absolute w-20 top-8 -left-4 fadeIn p-2 rounded-lg bg-[#5f29b7]">
                                        <button onClick={english} className="hover:bg-[#7641cd] w-full transition-all duration-500 cursor-pointer px-3 py-1.5 rounded-lg">en</button>
                                        <button onClick={urdu} className="hover:bg-[#7641cd] w-full transition-all duration-500 cursor-pointer px-3 py-1.5 rounded-lg">ur</button>
                                    </div>
                                )
                            }

                        </div>
                        <Link to={"/sign-in"} className="bg-[#5f29b7] flex items-center gap-3 md:px-7 px-5 cursor-pointer transition-all duration-500 hover:bg-[#5f29b7]/80 md:py-3 py-2 rounded-full">{t("signIn")}<FaArrowRightLong className="lg:flex hidden" />
                        </Link>
                        {/* <FaBars onClick={() => setNavbar(true)} className="text-2xl cursor-pointer lg:hidden" /> */}
                    </div>
                </div>
            </div >

            {/* responsive navbar */}

            < div className={`fixed bg-black text-white overflow-hidden transition-all duration-500 top-0 ${navbar ? "w-full" : "w-0"} left-0 z-50`
            }>
                <div className=" w-full px-10 relative pt-6 min-h-screen">
                    <IoClose onClick={() => setNavbar(false)} className='absolute cursor-pointer top-6 right-7 text-3xl' />
                    <img src={logo} alt="logo" className='h-10' />
                    <ul className='flex mt-10 flex-col space-y-7'>
                        <li><NavLink onClick={() => setNavbar(false)} to={"/"}>Home</NavLink></li>
                        <li><NavLink onClick={() => setNavbar(false)} to={"/features"}>Features</NavLink></li>
                        <li><NavLink onClick={() => setNavbar(false)} className="text-nowrap" to={"/About-us"}>About Us</NavLink></li>
                        <li><NavLink onClick={() => setNavbar(false)} to={"/faq"}>FAQ</NavLink></li>
                        <li><NavLink onClick={() => setNavbar(false)} className="text-nowrap" to={"/contact-us"}>Contact us</NavLink></li>
                    </ul>
                </div>
            </div >
        </>
    )
}

export default Navbar