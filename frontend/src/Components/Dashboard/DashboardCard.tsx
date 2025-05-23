
interface DashboardCardProps {
    title: string;
    amount: string;
    description: string;
    icon: React.ElementType;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, amount, description, icon: Icon }) => {
    return (
        <div className="w-full rounded-lg text-white p-5 bg-[#6d45b9]">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="opacity-80 text-sm">{title}</h2>
                    <h2 className="text-3xl font-semibold mt-3">{amount}</h2>
                    <p className="text-sm opacity-50 mt-1">{description}</p>
                </div>
                <Icon className="text-2xl opacity-90" />
            </div>
        </div>
    );
};

export default DashboardCard