import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

// Mock data for demonstration
const mockEvents = [
  {
    id: '1',
    name: 'Tech Conference 2024',
    description: 'Join us for the biggest tech conference of the year featuring industry leaders and innovative startups.',
    start_date: '2024-03-15T09:00:00',
    end_date: '2024-03-15T17:00:00',
    location: 'Lagos Convention Center',
    is_online: false,
    category: 'Technology',
    image_url: null,
    ticket_types: [
      { name: 'Early Bird', price: 15000, quantity_available: 100 },
      { name: 'Regular', price: 20000, quantity_available: 200 }
    ]
  },
  {
    id: '2',
    name: 'Digital Marketing Workshop',
    description: 'Learn the latest digital marketing strategies from industry experts.',
    start_date: '2024-03-20T10:00:00',
    end_date: '2024-03-20T16:00:00',
    location: 'Online',
    is_online: true,
    category: 'Workshop',
    image_url: null,
    ticket_types: [
      { name: 'Standard', price: 5000, quantity_available: 50 }
    ]
  },
  {
    id: '3',
    name: 'Music Festival Lagos',
    description: 'Experience the best of Nigerian music with top artists and emerging talents.',
    start_date: '2024-04-01T18:00:00',
    end_date: '2024-04-01T23:00:00',
    location: 'Tafawa Balewa Square',
    is_online: false,
    category: 'Music',
    image_url: null,
    ticket_types: [
      { name: 'General Admission', price: 8000, quantity_available: 1000 },
      { name: 'VIP', price: 25000, quantity_available: 100 }
    ]
  }
]

export default function EventsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Events</h1>
        <p className="text-gray-600">
          Discover amazing events happening near you
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search events..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option value="">All Categories</option>
          <option value="Technology">Technology</option>
          <option value="Music">Music</option>
          <option value="Workshop">Workshop</option>
          <option value="Conference">Conference</option>
        </select>
        <select className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option value="">All Locations</option>
          <option value="online">Online</option>
          <option value="lagos">Lagos</option>
          <option value="abuja">Abuja</option>
        </select>
      </div>

      {/* Events Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockEvents.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                  {event.category}
                </span>
                {event.is_online && (
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                    Online
                  </span>
                )}
              </div>
              <CardTitle className="text-xl">{event.name}</CardTitle>
              <CardDescription className="line-clamp-2">
                {event.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-2 2m8-2l2 2m-2-2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V9m8 0V9a2 2 0 00-2-2H8a2 2 0 00-2 2v0" />
                  </svg>
                  {new Date(event.start_date).toLocaleDateString('en-NG', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {event.location}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Starting from</p>
                    <p className="text-lg font-semibold text-blue-600">
                      ₦{Math.min(...event.ticket_types.map(t => t.price)).toLocaleString()}
                    </p>
                  </div>
                  <Link href={`/events/${event.id}`}>
                    <Button size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {mockEvents.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-2 2m8-2l2 2m-2-2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V9m8 0V9a2 2 0 00-2-2H8a2 2 0 00-2 2v0" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or check back later for new events.
          </p>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center mt-12">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" className="bg-blue-600 text-white">
            1
          </Button>
          <Button variant="outline" size="sm">
            2
          </Button>
          <Button variant="outline" size="sm">
            3
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

