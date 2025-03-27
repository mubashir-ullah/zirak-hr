import { Metadata } from "next";
import DashboardShell from "@/app/components/layout/DashboardShell";
import DashboardHeader from "@/app/components/layout/DashboardHeader";
import CompanyProfileForm from "@/app/components/hiring-manager/company/CompanyProfileForm";

export const metadata: Metadata = {
  title: "Edit Company Profile | Hiring Manager Dashboard",
  description: "Edit your company profile information.",
};

export default function EditCompanyProfilePage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Edit Company Profile"
        text="Update your company information, culture, and team members."
      />
      <CompanyProfileForm />
    </DashboardShell>
  );
}
