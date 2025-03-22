import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Talent Dashboard | Zirak HR',
  description: 'Manage your profile, resume, job applications, and skills on the Zirak HR platform',
}

export default function TalentDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      {children}
    </div>
  )
}
