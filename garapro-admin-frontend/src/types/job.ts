export type JobStatus = "requires-auth" | "in-progress" | "ready-to-start"

export interface Job {
  id: string
  title: string
  company: string
  contact?: string
  location?: string
  description?: string
  status: JobStatus
  progress: number
  statusText?: string
  // Link to RO Label settings
  labelId?: number
  // Selected labor rate snapshot
  laborRateId?: string
  laborRate?: number
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export interface CreateJobRequest {
  title: string
  company: string
  contact?: string
  location?: string
  description?: string
  status: JobStatus
  progress?: number
  statusText?: string
  dueDate?: string
}

export interface UpdateJobRequest extends Partial<CreateJobRequest> {
  id: string
}
