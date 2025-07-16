'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatCurrency, formatDateTime } from '@/lib/utils'

// Mock event data
const mockEvent = {
  id: '1',
  name: 'Tech Conference 2024',
  description: `Join us for the biggest tech conference of the year featuring industry leaders and innovative startups.

This comprehensive event will cover:
• Latest trends in artificial intelligence and machine learning
• Blockchain and cryptocurrency developments
• Startup pitch sessions and networking opportunities
• Hands-on workshops with cutting-edge technologies
• Panel discussions with industry experts

Whether you're a developer, entrepreneur, or tech enthusiast, this conference offers valuable insights and networking opportunities that will advance your career and expand your knowledge.`,
  start_date: '2024-03-15T09:00:00',
  end_date: '2024-03-15T17:00:00',
  location: 'Lagos Convention Center, Victoria Island, Lagos',
  is_online: false,
  category: 'Technology',
  image_url: null,
  organizer: {
    name: 'Tech Events Nigeria',
    email: 'info@techevents.ng'
  },
  ticket_types: [
    {
      id: '1',
      name: 'Early Bird',
      description: 'Limited time offer with full access to all sessions',
      price: 15000,
      quantity_available: 100,
      quantity_sold: 45
    },
    {
      id: '2',
      name: 'Regular',
      description: 'Standard ticket with full conference access',
      price: 20000,
      quantity_available: 200,
      quantity_sold: 78
    },
    {
      id: '3',
      name: 'VIP',
      description: 'Premium experience with exclusive networking session and lunch',
      price: 35000,
      quantity_available: 50,
      quantity_sold: 12
    }
  ]
}

export default function EventDetailPage() {
  const params = useParams()
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)

  const updateTicketQuantity = (ticketId: string, quantity: number) => {
    setSelectedTickets(prev => ({
      ...prev,
      [ticketId]: Math.max(0, quantity)
    }))
  }

  const getTotalPrice = () => {
    return Object.entries(selectedTickets).reduce((total, [ticketId, quantity]) => {
      const ticket = mockEvent.ticket_types.find(t => t.id === ticketId)
      return total + (ticket ? ticket.price * quantity : 0)
    }, 0)
  }

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((total, quantity) => total + quantity, 0)
  }

  const handlePurchase = async () => {
    if (getTotalTickets() === 0) return

    setLoading(true)
    try {
      // TODO: Implement checkout flow
      console.log('Purchasing tickets:', selectedTickets)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Redirect to checkout or show success
      alert('Redirecting to checkout...')
    } catch (error) {
      console.error('Error purchasing tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Event Details */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                {mockEvent.category}
              </span>
              {mockEvent.is_online && (
                <span className="inline-block px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                  Online Event
                </span>
              )}
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {mockEvent.name}
            </h1>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-gray-600">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-2 2m8-2l2 2m-2-2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V9m8 0V9a2 2 0 00-2-2H8a2 2 0 00-2 2v0" />
                </svg>
                {formatDateTime(mockEvent.start_date)}
              </div>

              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {mockEvent.location}
              </div>
            </div>
          </div>

          {/* Event Image Placeholder */}
          <div className="w-full h-64 bg-gray-200 rounded-lg mb-8 flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          {/* Event Description */}
          <Card>
            <CardHeader>
              <CardTitle>About This Event</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {mockEvent.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Organizer Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Organized By</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-semibold text-lg">
                    {mockEvent.organizer.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{mockEvent.organizer.name}</p>
                  <p className="text-gray-600 text-sm">{mockEvent.organizer.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ticket Selection */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Get Tickets</CardTitle>
              <CardDescription>
                Select your tickets and proceed to checkout
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockEvent.ticket_types.map((ticket) => {
                const available = ticket.quantity_available - ticket.quantity_sold
                const isAvailable = available > 0
                const selectedQuantity = selectedTickets[ticket.id] || 0

                return (
                  <div key={ticket.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{ticket.name}</h3>
                        <p className="text-sm text-gray-600">{ticket.description}</p>
                      </div>
                      <p className="font-bold text-lg text-blue-600">
                        {formatCurrency(ticket.price)}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      <p className="text-sm text-gray-500">
                        {isAvailable ? `${available} available` : 'Sold out'}
                      </p>

                      {isAvailable && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateTicketQuantity(ticket.id, selectedQuantity - 1)}
                            disabled={selectedQuantity === 0}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-medium">{selectedQuantity}</span>
                          <button
                            onClick={() => updateTicketQuantity(ticket.id, selectedQuantity + 1)}
                            disabled={selectedQuantity >= available}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

              {getTotalTickets() > 0 && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold">Total ({getTotalTickets()} tickets)</span>
                    <span className="font-bold text-xl text-blue-600">
                      {formatCurrency(getTotalPrice())}
                    </span>
                  </div>

                  <Button
                    onClick={handlePurchase}
                    loading={loading}
                    className="w-full"
                    size="lg"
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              )}

              {getTotalTickets() === 0 && (
                <p className="text-center text-gray-500 py-4">
                  Select tickets to proceed
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

