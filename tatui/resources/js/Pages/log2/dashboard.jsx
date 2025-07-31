import Layout from "@/layout/Layout";

function dashboard(){
    return (
        <h1>Logistics II</h1>
    )
}

dashboard.layout = page => <Layout children={page}/>
export default dashboard