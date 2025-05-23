import { FaArrowRightLong } from "react-icons/fa6";
import BodyWrapper from "../BodyWrapper";
import video from "../assets/video.mp4";
import InfiniteScrolling from "../Components/Home/InfiniteScrolling";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

const Home = () => {
  const navigate = useNavigate();

  const { t } = useTranslation();

  return (
    <>
      <BodyWrapper>
        <div className="min-h-[calc(100vh-5.5rem)] overflow-hidden flex items-end">
          <video
            className="w-full h-[calc(100vh-5.5rem)] scale-x-[-1] absolute top-[5.5rem] right-0 object-cover "
            autoPlay
            loop
            muted
          >
            <source src={video} type="video/mp4" />
          </video>
          <div className="z-10 relative max-w-7xl p-5 w-full mx-auto flex justify-between  min-h-[calc(100vh-20vh)] flex-col ">
            <div className="">
              <h1 className="md:text-7xl text-[2.8rem]  font-semibold max-w-[40rem] md:leading-[1.1] leading-tight capitalize ">
                {t("mainHeading.line1")}
                <span className="bg-gradient-to-r pt-3 block roboto font-medium from-[#5F29B7] to-white bg-clip-text text-transparent">
                  {t("mainHeading.line2")}
                </span>
              </h1>
              <div className="md:mt-8 mt-5">
                <button
                  onClick={() => navigate("/create-account")}
                  className="bg-[#5f29b7] flex items-center gap-3 md:px-12 px-9 cursor-pointer transition-all duration-500 hover:bg-[#5f29b7]/80 md:py-5 py-4 text-xl rounded-full"
                >
                  {t("signUp")}
                  <FaArrowRightLong />
                </button>
              </div>
            </div>
            <div className="py-5">
              <InfiniteScrolling />
            </div>
          </div>
        </div>
      </BodyWrapper>
    </>
  );
};

export default Home;
