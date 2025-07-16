'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { CreateEventWizard } from '@/components/events/CreateEventWizard'

function CreateEventContent() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
          <p className="text-gray-600 mt-2">
            Set up your event in just a few simple steps
          </p>
        </div>
      </div>
      
      <CreateEventWizard />
    </div>
  )
}

export default function CreateEventPage() {
  return (
    <ProtectedRoute>
      <CreateEventContent />
    </ProtectedRoute>
  )
}

