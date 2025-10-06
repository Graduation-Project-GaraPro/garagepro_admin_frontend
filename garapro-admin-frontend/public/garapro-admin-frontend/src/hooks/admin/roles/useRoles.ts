import { useState, useEffect } from 'react'
// hooks/admin/roles/useRoles.ts
interface RoleForm {
  name: string
  description: string
  permissionIds: string[]
  isDefault: boolean
}

interface ValidationErrors {
  name?: string
  description?: string
  permissionIds?: string
}

export const useRoleValidation = (form: RoleForm, shouldValidate: boolean) => {
  const [errors, setErrors] = useState<ValidationErrors>({})

  useEffect(() => {
    if (!shouldValidate) return

    const newErrors: ValidationErrors = {}

    // Validate name
    if (!form.name.trim()) {
      newErrors.name = 'Role name is required'
    } else if (form.name.trim().length < 2) {
      newErrors.name = 'Role name must be at least 2 characters long'
    } else if (form.name.trim().length > 50) {
      newErrors.name = 'Role name must be less than 50 characters'
    }

    // Validate description
    if (!form.description.trim()) {
      newErrors.description = 'Role description is required'
    } else if (form.description.trim().length < 5) {
      newErrors.description = 'Role description must be at least 5 characters long'
    } else if (form.description.trim().length > 200) {
      newErrors.description = 'Role description must be less than 200 characters'
    }

    // Validate permissions (optional - remove if you want to allow roles without permissions)
    if (form.permissionIds.length === 0) {
      newErrors.permissionIds = 'At least one permission is required'
    }

    setErrors(newErrors)
  }, [form, shouldValidate])

  return errors
}