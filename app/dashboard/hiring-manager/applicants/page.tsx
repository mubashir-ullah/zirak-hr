import { Metadata } from "next";
import DashboardShell from "@/app/components/layout/DashboardShell";
import DashboardHeader from "@/app/components/layout/DashboardHeader";
import ApplicantList from "@/app/components/hiring-manager/applicants/ApplicantList";

export const metadata: Metadata = {
  title: "All Applicants | Hiring Manager Dashboard",
  description: "View and manage all job applicants across all positions.",
};

export default function AllApplicantsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="All Applicants"
        text="Review and manage applicants across all job postings."
      />
      <ApplicantList />
    </DashboardShell>
  );
}
