import { Metadata } from "next";
import DashboardShell from "@/app/components/layout/DashboardShell";
import DashboardHeader from "@/app/components/layout/DashboardHeader";
import TeamManagement from "@/app/components/hiring-manager/company/TeamManagement";

export const metadata: Metadata = {
  title: "Team Management | Hiring Manager Dashboard",
  description: "Manage your company team members and their roles.",
};

export default function TeamManagementPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Team Management"
        text="Manage your company's team members, roles, and permissions."
      />
      <TeamManagement />
    </DashboardShell>
  );
}
