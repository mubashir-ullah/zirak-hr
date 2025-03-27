import { Metadata } from "next";
import DashboardShell from "@/app/components/layout/DashboardShell";
import DashboardHeader from "@/app/components/layout/DashboardHeader";
import ApplicantDetail from "@/app/components/hiring-manager/applicants/ApplicantDetail";

export const metadata: Metadata = {
  title: "Applicant Details | Hiring Manager Dashboard",
  description: "View and manage applicant details.",
};

export default function ApplicantDetailPage({ params }: { params: { id: string } }) {
  return (
    <DashboardShell>
      <ApplicantDetail applicantId={params.id} />
    </DashboardShell>
  );
}
