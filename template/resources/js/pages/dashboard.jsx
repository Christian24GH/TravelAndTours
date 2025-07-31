import Layout from "@/layout/layout";
export default function Dashboard() {
  return (
    <h1>Dashboard</h1>
  );
}

Dashboard.layout = (page) => <Layout children={page}/>
