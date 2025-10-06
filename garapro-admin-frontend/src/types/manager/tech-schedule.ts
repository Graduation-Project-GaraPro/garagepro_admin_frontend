export type TechStatus = "available" | "busy" | "break" | "offline"
export type JobPriority = "low" | "medium" | "high" | "urgent"
export type JobStatus = "assigned" | "in-progress" | "completed" | "on-hold"

export interface TechJob {
  id: string
  title: string
  customer: string
  vehicleInfo: string
  estimatedHours: number
  actualHours: number
  progress: number
  priority: JobPriority
  status: JobStatus
  startTime?: string
  endTime?: string
  dueDate: string
}

export interface Technician {
  id: string
  name: string
  code: string
  avatar?: string
  location: string
  skills: string[]
  status: TechStatus
  currentTask?: {
    jobId: string
    jobTitle: string
    startTime: string
    progress: number
    estimatedCompletion: string
  }
  shift: "morning" | "afternoon" | "night"
  totalJobs: number
  inProgressJobs: number
  assignedJobs: number
  timeTracking: {
    totalHours: number
    todayHours: number
    breakTime: number
  }
  schedule: {
    shiftStart: string
    shiftEnd: string
    breakStart?: string
    breakEnd?: string
  }
  todayStats: {
    hoursWorked: number
    targetHours: number
    jobsCompleted: number
    jobsAssigned: number
    jobsInProgress: number
    efficiency: number
  }
  jobs: TechJob[]
}

export interface TechScheduleFilters {
  search: string
  status: TechStatus | "all"
  location: string | "all"
  skills: string | "all"
  shift: "morning" | "afternoon" | "night" | "all"
}

export interface TechScheduleStats {
  totalTechnicians: number
  availableTechnicians: number
  busyTechnicians: number
  offlineTechnicians: number
  totalActiveJobs: number
  avgJobCompletion: number
}