import { Metadata } from "next";
import DashboardHeader from "@/app/components/layout/DashboardHeader";
import DashboardShell from "@/app/components/layout/DashboardShell";
import ApplicantList from "@/app/components/hiring-manager/applicants/ApplicantList";

export const metadata: Metadata = {
  title: "Job Applicants | Hiring Manager Dashboard",
  description: "View and manage applicants for a specific job posting.",
};

export default function JobApplicantsPage({ params }: { params: { id: string } }) {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Job Applicants"
        text="Review and manage applicants for this job posting."
      />
      <ApplicantList jobId={params.id} />
    </DashboardShell>
  );
}
