import Footer from "./Components/Footer"
import Navbar from "./Components/Navbar"

interface BodyWrapperProps {
    children: React.ReactNode
}

const BodyWrapper: React.FC<BodyWrapperProps> = ({ children }) => {
    return (
        <>
            <div className="bg-black text-white">
                <Navbar />
                {children}
                <Footer />
            </div>
        </>
    )
}


export default BodyWrapper