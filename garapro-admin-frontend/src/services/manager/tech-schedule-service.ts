import type { Technician, TechScheduleFilters, TechScheduleStats, TechStatus } from "@/types/manager/tech-schedule"

// Mock data for technicians
const mockTechnicians: Technician[] = [
  {
    id: "tech-001",
    name: "Sarah Bennett",
    code: "SB",
    location: "Bay 1",
    skills: ["Engine", "Transmission", "Brakes"],
    status: "busy",
    shift: "morning",
    totalJobs: 15,
    inProgressJobs: 2,
    assignedJobs: 3,
    timeTracking: {
      totalHours: 160,
      todayHours: 6.5,
      breakTime: 30
    },
    currentTask: {
      jobId: "job-001",
      jobTitle: "2018 Honda Civic - Engine Diagnostic",
      startTime: "08:30",
      progress: 65,
      estimatedCompletion: "11:30"
    },
    schedule: {
      shiftStart: "08:00",
      shiftEnd: "17:00",
      breakStart: "12:00",
      breakEnd: "13:00"
    },
    todayStats: {
      hoursWorked: 6.5,
      targetHours: 8,
      jobsCompleted: 2,
      jobsAssigned: 5,
      jobsInProgress: 2,
      efficiency: 92
    },
    jobs: [
      {
        id: "job-001",
        title: "Engine Diagnostic",
        customer: "John Smith",
        vehicleInfo: "2018 Honda Civic",
        estimatedHours: 3,
        actualHours: 2.5,
        progress: 65,
        priority: "high",
        status: "in-progress",
        startTime: "08:30",
        dueDate: "2024-01-15"
      },
      {
        id: "job-002",
        title: "Brake Pad Replacement",
        customer: "Mary Johnson",
        vehicleInfo: "2020 Toyota Camry",
        estimatedHours: 2,
        actualHours: 0,
        progress: 0,
        priority: "medium",
        status: "assigned",
        dueDate: "2024-01-16"
      }
    ]
  },
  {
    id: "tech-002",
    name: "Mike Rodriguez",
    code: "MR",
    location: "Bay 2",
    skills: ["Electrical", "AC/Heating", "Diagnostics"],
    status: "available",
    shift: "morning",
    totalJobs: 12,
    inProgressJobs: 0,
    assignedJobs: 1,
    timeTracking: {
      totalHours: 156,
      todayHours: 5.2,
      breakTime: 45
    },
    schedule: {
      shiftStart: "08:00",
      shiftEnd: "17:00",
      breakStart: "12:00",
      breakEnd: "13:00"
    },
    todayStats: {
      hoursWorked: 5.2,
      targetHours: 8,
      jobsCompleted: 3,
      jobsAssigned: 4,
      jobsInProgress: 0,
      efficiency: 98
    },
    jobs: [
      {
        id: "job-003",
        title: "AC System Repair",
        customer: "Robert Davis",
        vehicleInfo: "2019 Ford F-150",
        estimatedHours: 4,
        actualHours: 0,
        progress: 0,
        priority: "medium",
        status: "assigned",
        dueDate: "2024-01-17"
      }
    ]
  },
  {
    id: "tech-003",
    name: "Lisa Chen",
    code: "LC",
    location: "Bay 3",
    skills: ["Body Work", "Paint", "Collision Repair"],
    status: "break",
    shift: "afternoon",
    totalJobs: 8,
    inProgressJobs: 1,
    assignedJobs: 2,
    timeTracking: {
      totalHours: 144,
      todayHours: 4.0,
      breakTime: 60
    },
    schedule: {
      shiftStart: "09:00",
      shiftEnd: "18:00",
      breakStart: "13:00",
      breakEnd: "14:00"
    },
    todayStats: {
      hoursWorked: 4.0,
      targetHours: 8,
      jobsCompleted: 1,
      jobsAssigned: 3,
      jobsInProgress: 1,
      efficiency: 85
    },
    jobs: [
      {
        id: "job-004",
        title: "Bumper Repair",
        customer: "Jennifer Wilson",
        vehicleInfo: "2021 BMW X3",
        estimatedHours: 6,
        actualHours: 4,
        progress: 75,
        priority: "high",
        status: "in-progress",
        startTime: "09:00",
        dueDate: "2024-01-15"
      }
    ]
  },
  {
    id: "tech-004",
    name: "David Thompson",
    code: "DT",
    location: "Bay 4",
    skills: ["Tires", "Suspension", "Alignment"],
    status: "busy",
    shift: "morning",
    totalJobs: 18,
    inProgressJobs: 1,
    assignedJobs: 3,
    timeTracking: {
      totalHours: 168,
      todayHours: 7.5,
      breakTime: 30
    },
    currentTask: {
      jobId: "job-005",
      jobTitle: "2017 Audi A4 - Suspension Repair",
      startTime: "10:15",
      progress: 40,
      estimatedCompletion: "15:30"
    },
    schedule: {
      shiftStart: "07:00",
      shiftEnd: "16:00",
      breakStart: "11:30",
      breakEnd: "12:30"
    },
    todayStats: {
      hoursWorked: 7.5,
      targetHours: 8,
      jobsCompleted: 2,
      jobsAssigned: 4,
      jobsInProgress: 1,
      efficiency: 88
    },
    jobs: [
      {
        id: "job-005",
        title: "Suspension Repair",
        customer: "Michael Brown",
        vehicleInfo: "2017 Audi A4",
        estimatedHours: 5,
        actualHours: 2,
        progress: 40,
        priority: "urgent",
        status: "in-progress",
        startTime: "10:15",
        dueDate: "2024-01-15"
      }
    ]
  },
  {
    id: "tech-005",
    name: "Amanda Foster",
    code: "AF",
    location: "Bay 5",
    skills: ["Engine", "Oil Change", "Maintenance"],
    status: "offline",
    shift: "night",
    totalJobs: 5,
    inProgressJobs: 0,
    assignedJobs: 2,
    timeTracking: {
      totalHours: 120,
      todayHours: 0,
      breakTime: 0
    },
    schedule: {
      shiftStart: "14:00",
      shiftEnd: "23:00",
      breakStart: "19:00",
      breakEnd: "20:00"
    },
    todayStats: {
      hoursWorked: 0,
      targetHours: 8,
      jobsCompleted: 0,
      jobsAssigned: 2,
      jobsInProgress: 0,
      efficiency: 0
    },
    jobs: [
      {
        id: "job-006",
        title: "Oil Change Service",
        customer: "Sarah Miller",
        vehicleInfo: "2020 Nissan Altima",
        estimatedHours: 1,
        actualHours: 0,
        progress: 0,
        priority: "low",
        status: "assigned",
        dueDate: "2024-01-16"
      }
    ]
  }
]

export class TechScheduleService {
  private technicians: Technician[] = mockTechnicians

  async getAllTechnicians(): Promise<Technician[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    return [...this.technicians]
  }

  async getTechnicianById(id: string): Promise<Technician | null> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return this.technicians.find(tech => tech.id === id) || null
  }

  async filterTechnicians(filters: TechScheduleFilters): Promise<Technician[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    let filtered = [...this.technicians]

    if (filters.search && filters.search.trim()) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(tech => 
        tech.name.toLowerCase().includes(searchLower) ||
        tech.code.toLowerCase().includes(searchLower) ||
        tech.location.toLowerCase().includes(searchLower)
      )
    }

    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter(tech => tech.status === filters.status)
    }

    if (filters.location && filters.location !== "all") {
      filtered = filtered.filter(tech => tech.location === filters.location)
    }

    if (filters.skills && filters.skills !== "all") {
      filtered = filtered.filter(tech => 
        tech.skills.includes(filters.skills as string)
      )
    }

    if (filters.shift && filters.shift !== "all") {
      filtered = filtered.filter(tech => {
        const shiftStart = parseInt(tech.schedule.shiftStart.split(":")[0])
        switch (filters.shift) {
          case "morning":
            return shiftStart >= 6 && shiftStart < 12
          case "afternoon":
            return shiftStart >= 12 && shiftStart < 18
          case "night":
            return shiftStart >= 18 || shiftStart < 6
          default:
            return true
        }
      })
    }

    return filtered
  }

  async getScheduleStats(): Promise<TechScheduleStats> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const totalTechnicians = this.technicians.length
    const availableTechnicians = this.technicians.filter(t => t.status === "available").length
    const busyTechnicians = this.technicians.filter(t => t.status === "busy").length
    const offlineTechnicians = this.technicians.filter(t => t.status === "offline" || t.status === "break").length
    
    const totalActiveJobs = this.technicians.reduce((sum, tech) => {
      return sum + tech.jobs.filter(job => job.status === "in-progress").length
    }, 0)
    
    const completedJobs = this.technicians.reduce((sum, tech) => {
      return sum + tech.jobs.filter(job => job.status === "completed").length
    }, 0)
    
    const totalJobs = this.technicians.reduce((sum, tech) => sum + tech.jobs.length, 0)
    const avgJobCompletion = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0

    return {
      totalTechnicians,
      availableTechnicians,
      busyTechnicians,
      offlineTechnicians,
      totalActiveJobs,
      avgJobCompletion
    }
  }

  async updateTechStatus(techId: string, status: TechStatus): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const techIndex = this.technicians.findIndex(tech => tech.id === techId)
    if (techIndex !== -1) {
      this.technicians[techIndex].status = status
      return true
    }
    return false
  }

  // Mock method to simulate auto-refresh data updates
  async refreshData(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simulate some random updates
    this.technicians.forEach(tech => {
      if (tech.currentTask) {
        // Update progress randomly
        tech.currentTask.progress = Math.min(100, tech.currentTask.progress + Math.random() * 5)
        
        // Update hours worked
        tech.todayStats.hoursWorked += Math.random() * 0.1
      }
    })
  }
}

export const techScheduleService = new TechScheduleService()