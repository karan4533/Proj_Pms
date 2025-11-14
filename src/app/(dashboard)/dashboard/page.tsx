import { redirect } from "next/navigation";
import { getCurrent } from "@/features/auth/queries";
import { DashboardCharts } from "@/components/dashboard-charts";

const DashboardPage = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return (
    <div className="h-full flex flex-col p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.name}</p>
      </div>
      <DashboardCharts showFilters={true} />
    </div>
  );
};

export default DashboardPage;
