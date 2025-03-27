import { Metadata } from "next";
import DashboardHeader from "@/app/components/layout/DashboardHeader";
import DashboardShell from "@/app/components/layout/DashboardShell";
import JobListings from "@/app/components/hiring-manager/jobs/JobListings";

export const metadata: Metadata = {
  title: "Job Postings | Hiring Manager Dashboard",
  description: "Manage your job postings and view applicants.",
};

export default function JobsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Job Postings"
        text="Manage your job postings and view applicants."
      />
      <JobListings />
    </DashboardShell>
  );
}
