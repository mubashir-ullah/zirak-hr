import { Metadata } from "next";
import DashboardHeader from "@/app/components/layout/DashboardHeader";
import DashboardShell from "@/app/components/layout/DashboardShell";
import JobPostingForm from "@/app/components/hiring-manager/jobs/JobPostingForm";

export const metadata: Metadata = {
  title: "Create Job Posting | Hiring Manager Dashboard",
  description: "Create a new job posting for your company.",
};

export default function CreateJobPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Create Job Posting"
        text="Fill out the form below to create a new job posting."
      />
      <JobPostingForm />
    </DashboardShell>
  );
}
