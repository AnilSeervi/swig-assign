import { z } from "zod"

// Base schema for all responses
export const BaseResponseSchema = z.object({
  value: z.string(),
  isValid: z.boolean(),
  error: z.string().optional(),
})

// Date schema - validates YYYY-MM-DD format
export const DateSchema = z.object({
  value: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  isValid: z.boolean(),
  error: z.string().optional(),
})

// DateTime schema - validates YYYY-MM-DD HH:mm format
export const DateTimeSchema = z.object({
  value: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/),
  isValid: z.boolean(),
  error: z.string().optional(),
})

// Number schema
export const NumberSchema = z.object({
  value: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Value must be a valid number",
  }),
  isValid: z.boolean(),
  error: z.string().optional(),
})

// Helper function to validate date format
export function validateDate(value: string): z.infer<typeof DateSchema> {
  try {
    const [year, month, day] = value.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    const isValid = date instanceof Date && !isNaN(date.getTime()) &&
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day

    if (!isValid) {
      return { value, isValid: false, error: "Invalid date" }
    }

    return { value, isValid: true }
  } catch {
    return { value, isValid: false, error: "Invalid date format" }
  }
}

// Helper function to validate datetime format
export function validateDateTime(value: string): z.infer<typeof DateTimeSchema> {
  try {
    const [datePart, timePart] = value.split(' ')
    const [year, month, day] = datePart.split('-').map(Number)
    const [hours, minutes] = timePart.split(':').map(Number)
    
    const date = new Date(year, month - 1, day, hours, minutes)
    const isValid = date instanceof Date && !isNaN(date.getTime()) &&
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day &&
      date.getHours() === hours &&
      date.getMinutes() === minutes

    if (!isValid) {
      return { value, isValid: false, error: "Invalid date and time" }
    }

    return { value, isValid: true }
  } catch {
    return { value, isValid: false, error: "Invalid date and time format" }
  }
}

// Helper function to validate number format
export function validateNumber(value: string): z.infer<typeof NumberSchema> {
  const num = Number(value)
  if (isNaN(num)) {
    return { value, isValid: false, error: "Value must be a number" }
  }
  return { value, isValid: true }
}
