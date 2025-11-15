'use client'

import { useParams } from 'next/navigation'
import BranchForm from '@/components/admin/branches/BranchForm'

export default function EditBranchPage() {
  const params = useParams()
  const id = params.id as string

  return <BranchForm mode="edit" branchId={id} />
}
