import { IoWalletOutline } from "react-icons/io5";
import { PiHandWithdraw } from "react-icons/pi";
import { IoReceiptOutline } from "react-icons/io5";
import { Link } from "react-router";

const PaymentMethods = () => {
    return (
        <>
            <div className="p-5 w-full">
                <h2 className="text-white text-2xl font-medium">Payments</h2>
                <div className="mt-7">
                    <Link to={"/deposit"} className="flex p-4 bg-[#6d45b9] rounded-lg text-[#F5F5F5] cursor-pointer transition-all duration-500 hover:opacity-80 items-center gap-3">
                        <IoWalletOutline className="text-2xl" />
                        <p>Deposit</p>
                    </Link>
                    <Link to={"/withdrawal"} className="flex mt-3 p-4 bg-[#6d45b9] rounded-lg text-[#F5F5F5] cursor-pointer transition-all duration-500 hover:opacity-80 items-center gap-3">
                        <PiHandWithdraw className="text-2xl" />
                        <p>Withdraw</p>
                    </Link>
                    <Link to={"/transactions"} className="flex mt-3 p-4 bg-[#6d45b9] rounded-lg text-[#F5F5F5] cursor-pointer transition-all duration-500 hover:opacity-80 items-center gap-3">
                        <IoReceiptOutline className="text-2xl" />
                        <p>Transactions</p>
                    </Link>
                </div>
            </div >
        </>
    )
}

export default PaymentMethods