import type { Job } from "@/types/job"

// Mock data for development
const mockJobs: Job[] = [
  {
    id: "1",
    title: "Engine Repair",
    company: "2019 Dodge Journey",
    contact: "(111) 222-3333",
    location: "2019 Dodge Journey",
    status: "requires-auth",
    progress: 0,
    statusText: "No created 2 hours ago",
    labelId: 1,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
  },
  {
    id: "2",
    title: "Brake Service",
    company: "Amy Ping",
    contact: "(555) 555-1234",
    location: "2019 Buick Encore",
    status: "requires-auth",
    progress: 0,
    statusText: "No created 2 hours ago",
    labelId: 3,
    createdAt: "2024-01-01T09:00:00Z",
    updatedAt: "2024-01-01T09:00:00Z",
  },
  {
    id: "3",
    title: "Oil Change",
    company: "Chris Highlander",
    contact: "CME 2006 Jeep Liberty",
    status: "in-progress",
    progress: 100,
    statusText: "5 of 5 hrs complete",
    labelId: 5,
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-01T12:00:00Z",
  },
  {
    id: "4",
    title: "Transmission Service",
    company: "Josh Cole",
    contact: "(111) 111-1111",
    location: "2009 Dodge Charger",
    status: "ready-to-start",
    progress: 0,
    statusText: "No Labor Yet",
    labelId: 4,
    createdAt: "2024-01-01T07:00:00Z",
    updatedAt: "2024-01-01T07:00:00Z",
  },
]

class JobService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api"
  private jobs: Job[] = [...mockJobs] // In-memory storage for demo

  // Simulate API delay
  private delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  async getAllJobs(): Promise<Job[]> {
    await this.delay(500) // Simulate network delay

    // In production, this would be:
    // const response = await fetch(`${this.baseUrl}/jobs`)
    // return response.json()

    return [...this.jobs]
  }

  async getJobById(id: string): Promise<Job | null> {
    await this.delay(300)

    // In production:
    // const response = await fetch(`${this.baseUrl}/jobs/${id}`)
    // return response.json()

    return this.jobs.find((job) => job.id === id) || null
  }

  async createJob(jobData: Omit<Job, "id">): Promise<Job> {
    await this.delay(500)

    const newJob: Job = {
      ...jobData,
      id: Date.now().toString(), // Simple ID generation for demo
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // In production:
    // const response = await fetch(`${this.baseUrl}/jobs`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(jobData)
    // })
    // return response.json()

    this.jobs.push(newJob)
    return newJob
  }

  async updateJob(id: string, jobData: Partial<Job>): Promise<Job> {
    await this.delay(400)

    const jobIndex = this.jobs.findIndex((job) => job.id === id)
    if (jobIndex === -1) {
      throw new Error("Job not found")
    }

    const updatedJob: Job = {
      ...this.jobs[jobIndex],
      ...jobData,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    }

    // In production:
    // const response = await fetch(`${this.baseUrl}/jobs/${id}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(jobData)
    // })
    // return response.json()

    this.jobs[jobIndex] = updatedJob
    return updatedJob
  }

  async deleteJob(id: string): Promise<void> {
    await this.delay(300)

    const jobIndex = this.jobs.findIndex((job) => job.id === id)
    if (jobIndex === -1) {
      throw new Error("Job not found")
    }

    // In production:
    // await fetch(`${this.baseUrl}/jobs/${id}`, {
    //   method: 'DELETE'
    // })

    this.jobs.splice(jobIndex, 1)
  }

  async getJobsByStatus(status: string): Promise<Job[]> {
    await this.delay(400)

    // In production:
    // const response = await fetch(`${this.baseUrl}/jobs?status=${status}`)
    // return response.json()

    return this.jobs.filter((job) => job.status === status)
  }

  async searchJobs(query: string): Promise<Job[]> {
    await this.delay(600)

    // In production:
    // const response = await fetch(`${this.baseUrl}/jobs/search?q=${encodeURIComponent(query)}`)
    // return response.json()

    const lowercaseQuery = query.toLowerCase()
    return this.jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(lowercaseQuery) ||
        job.company.toLowerCase().includes(lowercaseQuery) ||
        job.contact?.toLowerCase().includes(lowercaseQuery) ||
        job.location?.toLowerCase().includes(lowercaseQuery),
    )
  }
}

export const jobService = new JobService()
