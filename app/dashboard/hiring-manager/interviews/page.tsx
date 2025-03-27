import { Metadata } from "next";
import DashboardShell from "@/app/components/layout/DashboardShell";
import DashboardHeader from "@/app/components/layout/DashboardHeader";
import InterviewDashboard from "@/app/components/hiring-manager/interviews/InterviewDashboard";

export const metadata: Metadata = {
  title: "Interview Management | Hiring Manager Dashboard",
  description: "Schedule interviews, manage interview questions, and review feedback.",
};

export default function InterviewManagementPage() {
  return (
    <DashboardShell>
      <InterviewDashboard />
    </DashboardShell>
  );
}
