import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "../../../ui/chart"

const chartData = [
    { month: "January", Profit: 186, Loss: 80 },
    { month: "February", Profit: 305, Loss: 200 },
    { month: "March", Profit: 237, Loss: 120 },
    { month: "April", Profit: 73, Loss: 190 },
    { month: "May", Profit: 209, Loss: 130 },
    { month: "June", Profit: 214, Loss: 140 },
]

const chartConfig = {
    Profit: {
        label: "Profit",
        color: "#6d45b9",
    },
    Loss: {
        label: "Loss",
        color: "#372359",
    },
} satisfies ChartConfig

const Chart = () => {
    return (
        <>
            <div className="">
                <ChartContainer config={chartConfig} className="max-h-[60vh] w-full">
                    <BarChart accessibilityLayer data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar dataKey="Profit" fill="#6d45b9" radius={4} />
                        <Bar dataKey="Loss" fill="#372359" radius={4} />
                    </BarChart>
                </ChartContainer>
            </div>
        </>
    )
}

export default Chart