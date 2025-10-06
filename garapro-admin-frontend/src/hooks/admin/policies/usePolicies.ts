import { useState, useEffect } from 'react'
import { Policy, PolicyFilters, PolicyResponse, policyService } from '@/services/policy-service'

export const usePolicies = (filters?: PolicyFilters) => {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  })

  const loadPolicies = async (newFilters?: PolicyFilters) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await policyService.getPolicies(newFilters || filters)
      setPolicies(response.policies)
      setPagination({
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load policies')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPolicies()
  }, [])

  return {
    policies,
    loading,
    error,
    pagination,
    loadPolicies,
    refetch: () => loadPolicies(filters)
  }
}

export const usePolicyStatistics = () => {
  const [statistics, setStatistics] = useState<{
    totalPolicies: number
    activePolicies: number
    draftPolicies: number
    archivedPolicies: number
    complianceScore: number
    violationsThisMonth: number
    policiesByCategory: Record<string, number>
    policiesByPriority: Record<string, number>
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await policyService.getPolicyStatistics()
        setStatistics(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load statistics')
      } finally {
        setLoading(false)
      }
    }

    loadStatistics()
  }, [])

  return { statistics, loading, error }
}

export const usePolicyOperations = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createPolicy = async (policyData: any) => {
    try {
      setLoading(true)
      setError(null)
      return await policyService.createPolicy(policyData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create policy'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const updatePolicy = async (id: number, policyData: any) => {
    try {
      setLoading(true)
      setError(null)
      return await policyService.updatePolicy(id, policyData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update policy'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const deletePolicy = async (id: number) => {
    try {
      setLoading(true)
      setError(null)
      await policyService.deletePolicy(id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete policy'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const activatePolicy = async (id: number) => {
    try {
      setLoading(true)
      setError(null)
      await policyService.activatePolicy(id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to activate policy'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const deactivatePolicy = async (id: number) => {
    try {
      setLoading(true)
      setError(null)
      await policyService.deactivatePolicy(id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deactivate policy'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const archivePolicy = async (id: number) => {
    try {
      setLoading(true)
      setError(null)
      await policyService.archivePolicy(id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to archive policy'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    createPolicy,
    updatePolicy,
    deletePolicy,
    activatePolicy,
    deactivatePolicy,
    archivePolicy
  }
}

export const usePolicyCategories = () => {
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await policyService.getPolicyCategories()
        setCategories(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load categories')
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  return { categories, loading, error }
}

export const usePolicyTags = () => {
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTags = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await policyService.getPolicyTags()
        setTags(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tags')
      } finally {
        setLoading(false)
      }
    }

    loadTags()
  }, [])

  return { tags, loading, error }
}