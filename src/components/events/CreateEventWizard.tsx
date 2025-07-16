'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { EVENT_CATEGORIES, PRICING_PLANS } from '@/types'

interface EventFormData {
  // Step 1: Event Details
  name: string
  description: string
  start_date: string
  end_date: string
  location: string
  is_online: boolean
  category: string
  image_url?: string
  
  // Step 2: Ticket Types
  ticket_types: {
    name: string
    description: string
    price: number
    quantity_available?: number
    sales_start_date?: string
    sales_end_date?: string
  }[]
  
  // Step 3: Pricing Plan
  pricing_plan: 'flat_fee' | 'per_ticket'
}

const initialFormData: EventFormData = {
  name: '',
  description: '',
  start_date: '',
  end_date: '',
  location: '',
  is_online: false,
  category: '',
  ticket_types: [{
    name: 'General Admission',
    description: '',
    price: 0,
    quantity_available: undefined,
  }],
  pricing_plan: 'per_ticket'
}

export function CreateEventWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<EventFormData>(initialFormData)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()

  const updateFormData = (updates: Partial<EventFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const addTicketType = () => {
    setFormData(prev => ({
      ...prev,
      ticket_types: [
        ...prev.ticket_types,
        {
          name: '',
          description: '',
          price: 0,
          quantity_available: undefined,
        }
      ]
    }))
  }

  const updateTicketType = (index: number, updates: Partial<EventFormData['ticket_types'][0]>) => {
    setFormData(prev => ({
      ...prev,
      ticket_types: prev.ticket_types.map((ticket, i) => 
        i === index ? { ...ticket, ...updates } : ticket
      )
    }))
  }

  const removeTicketType = (index: number) => {
    if (formData.ticket_types.length > 1) {
      setFormData(prev => ({
        ...prev,
        ticket_types: prev.ticket_types.filter((_, i) => i !== index)
      }))
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Event name is required'
      if (!formData.start_date) newErrors.start_date = 'Start date is required'
      if (!formData.end_date) newErrors.end_date = 'End date is required'
      if (!formData.location.trim() && !formData.is_online) newErrors.location = 'Location is required for physical events'
      if (!formData.category) newErrors.category = 'Category is required'
      
      if (formData.start_date && formData.end_date) {
        if (new Date(formData.start_date) >= new Date(formData.end_date)) {
          newErrors.end_date = 'End date must be after start date'
        }
      }
    }

    if (step === 2) {
      formData.ticket_types.forEach((ticket, index) => {
        if (!ticket.name.trim()) newErrors[`ticket_${index}_name`] = 'Ticket name is required'
        if (ticket.price < 0) newErrors[`ticket_${index}_price`] = 'Price cannot be negative'
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setLoading(true)
    try {
      // TODO: Implement API call to create event
      console.log('Creating event:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Redirect to dashboard or event page
      router.push('/dashboard')
    } catch (error) {
      console.error('Error creating event:', error)
    } finally {
      setLoading(false)
    }
  }

  const categoryOptions = EVENT_CATEGORIES.map(category => ({
    value: category,
    label: category
  }))

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                ${currentStep >= step 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
                }
              `}>
                {step}
              </div>
              {step < 3 && (
                <div className={`
                  w-16 h-1 mx-2
                  ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'}
                `} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-4">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">
              Step {currentStep} of 3
            </p>
            <p className="text-sm text-gray-600">
              {currentStep === 1 && 'Event Details'}
              {currentStep === 2 && 'Ticket Options'}
              {currentStep === 3 && 'Pricing Plan & Launch'}
            </p>
          </div>
        </div>
      </div>

      {/* Step 1: Event Details */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
            <CardDescription>
              Tell us about your event and when it&apos;s happening
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input
              label="Event Name"
              value={formData.name}
              onChange={(e) => updateFormData({ name: e.target.value })}
              error={errors.name}
              required
              placeholder="Enter your event name"
            />

            <Textarea
              label="Event Description"
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
              placeholder="Describe your event..."
              rows={4}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Start Date & Time"
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => updateFormData({ start_date: e.target.value })}
                error={errors.start_date}
                required
              />

              <Input
                label="End Date & Time"
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => updateFormData({ end_date: e.target.value })}
                error={errors.end_date}
                required
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_online"
                  checked={formData.is_online}
                  onChange={(e) => updateFormData({ is_online: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="is_online" className="text-sm font-medium text-gray-700">
                  This is an online event
                </label>
              </div>

              {!formData.is_online && (
                <Input
                  label="Event Location"
                  value={formData.location}
                  onChange={(e) => updateFormData({ location: e.target.value })}
                  error={errors.location}
                  required={!formData.is_online}
                  placeholder="Enter venue address"
                />
              )}
            </div>

            <Select
              label="Event Category"
              value={formData.category}
              onChange={(e) => updateFormData({ category: e.target.value })}
              options={categoryOptions}
              error={errors.category}
              required
            />
          </CardContent>
        </Card>
      )}

      {/* Step 2: Ticket Types */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Ticket Options</CardTitle>
            <CardDescription>
              Set up different ticket types with pricing and availability
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {formData.ticket_types.map((ticket, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Ticket Type {index + 1}</h3>
                  {formData.ticket_types.length > 1 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeTicketType(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Ticket Name"
                    value={ticket.name}
                    onChange={(e) => updateTicketType(index, { name: e.target.value })}
                    error={errors[`ticket_${index}_name`]}
                    required
                    placeholder="e.g., General Admission, VIP Pass"
                  />

                  <Input
                    label="Price (₦)"
                    type="number"
                    min="0"
                    step="0.01"
                    value={ticket.price}
                    onChange={(e) => updateTicketType(index, { price: parseFloat(e.target.value) || 0 })}
                    error={errors[`ticket_${index}_price`]}
                    required
                  />
                </div>

                <div className="mt-4">
                  <Textarea
                    label="Description (Optional)"
                    value={ticket.description}
                    onChange={(e) => updateTicketType(index, { description: e.target.value })}
                    placeholder="Describe what's included with this ticket..."
                    rows={2}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <Input
                    label="Quantity Available"
                    type="number"
                    min="1"
                    value={ticket.quantity_available || ''}
                    onChange={(e) => updateTicketType(index, { 
                      quantity_available: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    placeholder="Leave empty for unlimited"
                  />

                  <Input
                    label="Sales Start Date"
                    type="datetime-local"
                    value={ticket.sales_start_date || ''}
                    onChange={(e) => updateTicketType(index, { sales_start_date: e.target.value || undefined })}
                  />

                  <Input
                    label="Sales End Date"
                    type="datetime-local"
                    value={ticket.sales_end_date || ''}
                    onChange={(e) => updateTicketType(index, { sales_end_date: e.target.value || undefined })}
                  />
                </div>
              </div>
            ))}

            <Button variant="outline" onClick={addTicketType} className="w-full">
              Add Another Ticket Type
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Pricing Plan */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Pricing Plan & Launch</CardTitle>
            <CardDescription>
              Choose your pricing model and launch your event
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div 
                className={`
                  border-2 rounded-lg p-6 cursor-pointer transition-colors
                  ${formData.pricing_plan === 'per_ticket' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
                onClick={() => updateFormData({ pricing_plan: 'per_ticket' })}
              >
                <div className="flex items-center mb-4">
                  <input
                    type="radio"
                    checked={formData.pricing_plan === 'per_ticket'}
                    onChange={() => updateFormData({ pricing_plan: 'per_ticket' })}
                    className="mr-3"
                  />
                  <h3 className="text-lg font-semibold">Per-Ticket Fee</h3>
                </div>
                <p className="text-2xl font-bold text-blue-600 mb-2">
                  {PRICING_PLANS.PER_TICKET.percentage}% + ₦{PRICING_PLANS.PER_TICKET.fixed_fee}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  {PRICING_PLANS.PER_TICKET.description}
                </p>
                <ul className="text-sm space-y-1">
                  {PRICING_PLANS.PER_TICKET.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <div 
                className={`
                  border-2 rounded-lg p-6 cursor-pointer transition-colors
                  ${formData.pricing_plan === 'flat_fee' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
                onClick={() => updateFormData({ pricing_plan: 'flat_fee' })}
              >
                <div className="flex items-center mb-4">
                  <input
                    type="radio"
                    checked={formData.pricing_plan === 'flat_fee'}
                    onChange={() => updateFormData({ pricing_plan: 'flat_fee' })}
                    className="mr-3"
                  />
                  <h3 className="text-lg font-semibold">Flat Fee</h3>
                </div>
                <p className="text-2xl font-bold text-blue-600 mb-2">
                  ₦{PRICING_PLANS.FLAT_FEE.price.toLocaleString()}/month
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  {PRICING_PLANS.FLAT_FEE.description}
                </p>
                <ul className="text-sm space-y-1">
                  {PRICING_PLANS.FLAT_FEE.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Event Summary */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Event Summary</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Event:</strong> {formData.name}</p>
                <p><strong>Date:</strong> {formData.start_date ? new Date(formData.start_date).toLocaleDateString() : 'Not set'}</p>
                <p><strong>Location:</strong> {formData.is_online ? 'Online Event' : formData.location}</p>
                <p><strong>Ticket Types:</strong> {formData.ticket_types.length}</p>
                <p><strong>Pricing Plan:</strong> {formData.pricing_plan === 'flat_fee' ? 'Flat Fee' : 'Per-Ticket Fee'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          Previous
        </Button>

        {currentStep < 3 ? (
          <Button onClick={nextStep}>
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} loading={loading}>
            Launch Event
          </Button>
        )}
      </div>
    </div>
  )
}

