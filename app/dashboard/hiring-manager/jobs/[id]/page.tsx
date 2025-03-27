import { Metadata } from "next";
import DashboardShell from "@/app/components/layout/DashboardShell";
import JobDetail from "@/app/components/hiring-manager/jobs/JobDetail";

export const metadata: Metadata = {
  title: "Job Details | Hiring Manager Dashboard",
  description: "View and manage job posting details.",
};

export default function JobDetailPage({ params }: { params: { id: string } }) {
  return (
    <DashboardShell>
      <JobDetail jobId={params.id} />
    </DashboardShell>
  );
}
