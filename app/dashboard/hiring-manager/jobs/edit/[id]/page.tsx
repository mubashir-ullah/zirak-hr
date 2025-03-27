import { Metadata } from "next";
import DashboardHeader from "@/app/components/layout/DashboardHeader";
import DashboardShell from "@/app/components/layout/DashboardShell";
import JobPostingForm from "@/app/components/hiring-manager/jobs/JobPostingForm";

export const metadata: Metadata = {
  title: "Edit Job Posting | Hiring Manager Dashboard",
  description: "Edit an existing job posting for your company.",
};

export default function EditJobPage({ params }: { params: { id: string } }) {
  // In a real app, we would fetch the job data based on the ID
  // For now, we'll pass a mock job object to the form
  const mockJob = {
    id: parseInt(params.id),
    title: 'Senior Frontend Developer',
    company: 'Zirak Technologies',
    location: 'New York, NY',
    locationType: 'hybrid',
    employmentType: 'full-time',
    experienceLevel: 'senior',
    salaryMin: '120000',
    salaryMax: '150000',
    description: 'We are looking for a Senior Frontend Developer to join our team...',
    requirements: 'At least 5 years of experience with React...',
    responsibilities: 'Developing new user-facing features using React.js...',
    benefits: 'Competitive salary, health insurance, flexible work hours...',
    skills: 'React, JavaScript, TypeScript, Redux, HTML, CSS',
    applicationDeadline: '2025-04-20',
    isPublished: true,
  };

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Edit Job Posting"
        text="Update the details of your job posting."
      />
      <JobPostingForm jobData={mockJob} />
    </DashboardShell>
  );
}
