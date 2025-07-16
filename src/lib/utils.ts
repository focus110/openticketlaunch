import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import QRCode from 'qrcode'
import { format, parseISO, isValid } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export function formatDate(date: string | Date, formatString: string = 'PPP'): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return 'Invalid date'
    return format(dateObj, formatString)
  } catch (error) {
    return 'Invalid date'
  }
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, 'PPP p')
}

export async function generateQRCode(data: string): Promise<string> {
  try {
    return await QRCode.toDataURL(data, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

export function generateTicketQRData(ticketId: string, eventId: string): string {
  return JSON.stringify({
    ticketId,
    eventId,
    timestamp: Date.now()
  })
}

export function parseTicketQRData(qrData: string): { ticketId: string; eventId: string; timestamp: number } | null {
  try {
    const parsed = JSON.parse(qrData)
    if (parsed.ticketId && parsed.eventId && parsed.timestamp) {
      return parsed
    }
    return null
  } catch (error) {
    return null
  }
}

export function generateUniqueId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function calculateEventDuration(startDate: string, endDate: string): string {
  try {
    const start = parseISO(startDate)
    const end = parseISO(endDate)
    
    if (!isValid(start) || !isValid(end)) return 'Invalid dates'
    
    const diffMs = end.getTime() - start.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''}`
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`
    }
  } catch (error) {
    return 'Invalid dates'
  }
}

export function getEventStatus(startDate: string, endDate: string): 'upcoming' | 'ongoing' | 'ended' {
  try {
    const now = new Date()
    const start = parseISO(startDate)
    const end = parseISO(endDate)
    
    if (!isValid(start) || !isValid(end)) return 'upcoming'
    
    if (now < start) return 'upcoming'
    if (now >= start && now <= end) return 'ongoing'
    return 'ended'
  } catch (error) {
    return 'upcoming'
  }
}

export function calculateTicketFees(price: number, pricingPlan: 'flat_fee' | 'per_ticket'): {
  basePrice: number
  fees: number
  total: number
} {
  const basePrice = price
  
  if (pricingPlan === 'flat_fee') {
    return {
      basePrice,
      fees: 0,
      total: basePrice
    }
  } else {
    // Per-ticket: 2.5% + NGN50
    const percentageFee = basePrice * 0.025
    const fixedFee = 50
    const fees = percentageFee + fixedFee
    
    return {
      basePrice,
      fees,
      total: basePrice + fees
    }
  }
}

