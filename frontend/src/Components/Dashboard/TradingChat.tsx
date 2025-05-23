// import { useEffect, useRef, useState } from "react";
// import { createChart, ColorType } from "lightweight-charts";

// interface ChartDataPoint {
//   time: number; // ✅ Keep as a number (Unix timestamp)
//   value: number;
// }

// interface ChartComponentProps {
//   data: ChartDataPoint[];
//   colors?: {
//     backgroundColor?: string;
//     lineColor?: string;
//     textColor?: string;
//     areaTopColor?: string;
//     areaBottomColor?: string;
//   };
// }

// export const ChartComponent = ({ data, colors = {} }: ChartComponentProps) => {
//   const {
//     backgroundColor = "black",
//     lineColor = "#FF5733",
//     textColor = "white",
//     areaTopColor = "#FF5733",
//     areaBottomColor = "rgba(255, 87, 51, 0.3)",
//   } = colors;

//   const chartContainerRef = useRef<HTMLDivElement>(null);
//   const [chartData, setChartData] = useState<ChartDataPoint[]>(data);
//   const chartRef = useRef<any>(null);
//   const seriesRef = useRef<any>(null);

//   useEffect(() => {
//     if (!chartContainerRef.current) return;

//     const chart = createChart(chartContainerRef.current, {
//       layout: {
//         background: { type: ColorType.Solid, color: backgroundColor },
//         textColor,
//       },
//       width: chartContainerRef.current.clientWidth,
//       height: chartContainerRef.current.clientHeight,
//       timeScale: {
//         timeVisible: true,
//         secondsVisible: true,
//       },
//     });

//     const newSeries = chart.addAreaSeries({
//       lineColor,
//       topColor: areaTopColor,
//       bottomColor: areaBottomColor,
//     });

//     newSeries.setData(chartData);
//     chartRef.current = chart;
//     seriesRef.current = newSeries;

//     chart.timeScale().fitContent(); // ✅ Auto-fit content initially

//     const handleResize = () => {
//       if (chartContainerRef.current) {
//         chart.applyOptions({
//           width: chartContainerRef.current.clientWidth,
//           height: chartContainerRef.current.clientHeight,
//         });
//       }
//     };

//     window.addEventListener("resize", handleResize);

//     return () => {
//       window.removeEventListener("resize", handleResize);
//       chart.remove();
//     };
//   }, [backgroundColor, lineColor, textColor, areaTopColor, areaBottomColor]);

//   useEffect(() => {
//     if (seriesRef.current) {
//       seriesRef.current.setData(chartData);
//       chartRef.current?.timeScale().fitContent();
//     }
//   }, [chartData]);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setChartData((prevData) => {
//         const now = Math.floor(Date.now() / 1000); // ✅ Get Unix timestamp in seconds

//         const newDataPoint = {
//           time: now, // ✅ Unique and increasing time
//           value: prevData.length
//             ? prevData[prevData.length - 1].value + (Math.random() * 2 - 1)
//             : 30,
//         };

//         const newChartData = [...prevData, newDataPoint].slice(-50); // ✅ Keep last 50 points

//         // ✅ Automatically scroll chart to the latest data
//         setTimeout(() => {
//           if (chartRef.current) {
//             chartRef.current.timeScale().scrollToRealTime(); 
//           }
//         }, 100);

//         return newChartData;
//       });
//     }, 1000);

//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div
//       ref={chartContainerRef}
//       className="bg-black w-full md:h-screen h-[calc(100vh-15rem)] max-w-[100%] overflow-hidden"
//     />
//   );
// };

// function TradingChat() {
//   return (
//     <div className="w-full h-screen">
//       <ChartComponent data={[]} />
//     </div>
//   );
// }

// export default TradingChat;
