
const Loader = () => {
    return (
        <div className='flex space-x-2 justify-center items-center bg-[#171022] h-screen dark:invert'>
            <span className='sr-only'>Loading...</span>
            <div className='md:h-5 h-3 md:w-5 w-3 bg-[#6d45b9] rounded-full animate-bounce [animation-delay:-0.3s]'></div>
            <div className='md:h-5 h-3 md:w-5 w-3 bg-[#6d45b9] rounded-full animate-bounce [animation-delay:-0.15s]'></div>
            <div className='md:h-5 h-3 md:w-5 w-3 bg-[#6d45b9] rounded-full animate-bounce'></div>
        </div>
    )
}

export default Loader