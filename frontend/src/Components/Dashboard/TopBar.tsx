import { FiUser } from "react-icons/fi"
import { IoWalletOutline } from "react-icons/io5";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "../ui/sheet"
import PaymentMethods from "./PaymentMethods";
import { Link } from "react-router";

const TopBar = () => {
    return (
        <div>

            <div className="md:hidden flex items-center justify-between p-3 bg-[#171022]">
                <Link to={"/user-dashboard"} className="w-12 h-12 hover:opacity-80 transition-all duration-500 cursor-pointer bg-[#5f29b760] flex items-center justify-center text-white rounded-full">
                    <FiUser className="text-2xl" />
                </Link>
                <div className="bg-[#171022] py-3 rounded-lg border-[#403257] px-5 text-end border right-5 text-white"><span className="text-[#c4c4ca] text-sm">PKR</span> 0.00</div>
                <Sheet>
                    <SheetTrigger>
                        <div className="w-12 h-12 hover:opacity-80 transition-all duration-500 cursor-pointer bg-[#5f29b760] flex items-center justify-center text-white rounded-lg">
                            <IoWalletOutline className="text-2xl" />
                        </div>
                    </SheetTrigger>
                    <SheetContent>
                        <PaymentMethods />
                    </SheetContent>
                </Sheet>
            </div>


        </div>
    )
}

export default TopBar