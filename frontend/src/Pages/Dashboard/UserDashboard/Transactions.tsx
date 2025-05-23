import TransactionsTable from "../../../Components/Dashboard/UserDashboard/TransactionsTable";
import UserDashboardLeftBar from "../../../Components/Dashboard/UserDashboard/UserDashboardLeftBar";


const Transactions = () => {
    return (
        <UserDashboardLeftBar breadcrumb="Transactions">
            <div className="flex flex-col">
                <TransactionsTable />
            </div>
        </UserDashboardLeftBar>
    );
};

export default Transactions;
