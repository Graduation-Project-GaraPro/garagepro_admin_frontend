export interface Label {
  id: number
  name: string
  category: string
  color: string
  description: string
  isDefault: boolean
  // Optional business fields
  active?: boolean
  usageCount?: number
  slug?: string
  createdAt?: string
  updatedAt?: string
}

export interface NewLabel {
  name: string
  category: string
  color: string
  description: string
  // Optional business fields
  active?: boolean
  slug?: string
}
