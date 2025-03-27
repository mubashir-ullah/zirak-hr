import { Metadata } from "next";
import DashboardShell from "@/app/components/layout/DashboardShell";
import CompanyProfile from "@/app/components/hiring-manager/company/CompanyProfile";

export const metadata: Metadata = {
  title: "Company Profile | Hiring Manager Dashboard",
  description: "View and manage your company profile.",
};

export default function CompanyProfilePage() {
  return (
    <DashboardShell>
      <CompanyProfile />
    </DashboardShell>
  );
}
