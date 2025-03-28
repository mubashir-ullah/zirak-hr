'use client'

import { Suspense } from 'react'
import HRDashboard from '@/components/HRDashboard'
import Overview from '@/components/dashboard/hr/Overview'

export default function HRDashboardPage() {
  return (
    <HRDashboard>
      <Suspense fallback={<div>Loading dashboard...</div>}>
        <Overview />
      </Suspense>
    </HRDashboard>
  )
}
