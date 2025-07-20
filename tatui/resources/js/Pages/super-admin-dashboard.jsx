import Layout from "@/layout/Layout";

function SuperAdminDashboard(){

    return (
        <h1>Super Admin Dashboard</h1>
    )
}

SuperAdminDashboard.layout = page => <Layout children={page}/>
export default SuperAdminDashboard
