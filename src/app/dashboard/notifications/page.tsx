import DashboardFooter from '@/components/dashboard/DashboardFooter'
import NotificationsPage from '@/components/notification/NotificationScreen'
import React from 'react'

function page() {
  return (
    <div>
      <NotificationsPage/>
      <DashboardFooter/>
    </div>
  )
}

export default page
