import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import Banner from "@/components/admin/Banner"

interface LoadingSkeletonProps {
  banner: { type: 'success' | 'error'; message: string } | null
  onCloseBanner: () => void
}

export const LoadingSkeleton = ({ banner, onCloseBanner }: LoadingSkeletonProps) => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <Link href="/admin/branches">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Branches
        </Button>
      </Link>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Branch</h1>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
    
    <Banner banner={banner} onClose={onCloseBanner} />
    
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-gray-200 rounded animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
)

interface ErrorStateProps {
  error: string
}

export const ErrorState = ({ error }: ErrorStateProps) => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <Link href="/admin/branches">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Branches
        </Button>
      </Link>
    </div>
    <Card>
      <CardContent className="p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Retry
        </Button>
      </CardContent>
    </Card>
  </div>
)