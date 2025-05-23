import Slider from 'react-infinite-logo-slider'

const InfiniteScrolling = () => {

    const boxWidth = window.innerWidth >= 400 ? "300px" : "190px"

    return (
        <Slider
            width={boxWidth}
            duration={60}
            pauseOnHover={true}
            blurBorders={false}
            blurBorderColor={'#fff'}
        >
            <Slider.Slide>
                <img src="/home/binance.png" alt="crypto" className='md:w-52 w-36 hover:border-[#8F00FF] border border-transparent duration-500 transition-all rounded-3xl' />
            </Slider.Slide>
            <Slider.Slide>
                <img src="/home/ftx.png" alt="crypto" className='md:w-52 w-36 hover:border-[#8F00FF] border border-transparent duration-500 transition-all rounded-3xl' />
            </Slider.Slide>
            <Slider.Slide>
                <img src="/home/huobi.png" alt="crypto" className='md:w-52 w-36 hover:border-[#8F00FF] border border-transparent duration-500 transition-all rounded-3xl' />
            </Slider.Slide>
            <Slider.Slide>
                <img src="/home/exmo.png" alt="crypto" className='md:w-52 w-36 hover:border-[#8F00FF] border border-transparent duration-500 transition-all rounded-3xl' />
            </Slider.Slide>
            <Slider.Slide>
                <img src="/home/ok.png" alt="crypto" className='md:w-52 w-36 hover:border-[#8F00FF] border border-transparent duration-500 transition-all rounded-3xl' />
            </Slider.Slide>
            <Slider.Slide>
                <img src="/home/bybit.png" alt="crypto" className='md:w-52 w-36 hover:border-[#8F00FF] border border-transparent duration-500 transition-all rounded-3xl' />
            </Slider.Slide>
        </Slider>
    )
}

export default InfiniteScrolling