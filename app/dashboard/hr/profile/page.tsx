'use client'

import { Suspense } from 'react'
import HRDashboard from '@/components/HRDashboard'
import HRProfile from '@/components/dashboard/hr/Profile'

export default function HRProfilePage() {
  return (
    <HRDashboard>
      <Suspense fallback={<div>Loading profile...</div>}>
        <HRProfile />
      </Suspense>
    </HRDashboard>
  )
}
