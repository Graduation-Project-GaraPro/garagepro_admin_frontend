'use client'

import { useParams } from 'next/navigation'
import BranchForm from '@/components/admin/branches/BranchForm'

export default function EditBranchPage() {
  const params = useParams()
  const raw = params?.id
  const id = Array.isArray(raw) ? raw[0] : raw

  if (!id) return <div>Loading...</div>

  return <BranchForm mode="edit" branchId={id} />
}
