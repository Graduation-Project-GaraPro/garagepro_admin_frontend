'use client'

import { useRef, useState } from 'react'
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { branchService, ImportErrorDetail, ImportResult } from '@/services/branch-service'
import { toast } from 'sonner'

const steps = [
  { id: 1, title: 'Upload File', description: 'Select an Excel file using the provided template.' },
  { id: 2, title: 'Validate & Import', description: 'The server validates structure and business rules.' },
  { id: 3, title: 'Result', description: 'Review the outcome and possible errors.' },
]

export default function BranchImportPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [errors, setErrors] = useState<ImportErrorDetail[] | null>(null)
  const [currentStep, setCurrentStep] = useState<number>(1)

  const handleChooseFile = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedFileName(file?.name ?? null)

    // Đổi file khác → reset lại
    setResult(null)
    setErrors(null)
    setCurrentStep(1)
  }

  const handleImport = async () => {
    const file = fileInputRef.current?.files?.[0]

    if (!file) {
      toast.error('Please select an Excel file before importing.')
      setCurrentStep(1)
      return
    }

    setIsImporting(true)
    setResult(null)
    setErrors(null)
    // Bắt đầu import → step 2
    setCurrentStep(2)

    try {
      const res = await branchService.importMasterData(file)
      setResult(res)
      setErrors(res.errors || null)

      if (res.success) {
        // Thành công → step 3
        setCurrentStep(3)
        toast.success('Master data imported successfully', {
          description: res.message,
        })
      } else {
        // Lỗi từ server nhưng không throw → vẫn ở step 2
        setCurrentStep(2)
        toast.error('Import failed', {
          description: res.message,
        })
      }
    } catch (err: any) {
      console.log('❌ Import error object:', err)

      if (err && typeof err === 'object' && 'success' in err) {
        const r = err as ImportResult
        setResult(r)
        setErrors(r.errors || null)

        // Lỗi → step 2
        setCurrentStep(2)

        toast.error('Import failed', {
          description: r.message,
        })
      } else {
        // Lỗi không có format ImportResult → vẫn coi là step 2
        setCurrentStep(2)
        toast.error('Import failed', {
          description: err instanceof Error ? err.message : 'Unknown error occurred.',
        })
      }
    } finally {
      setIsImporting(false)
    }
  }

  const getStepStatus = (stepId: number) => {
    if (currentStep > stepId) return 'completed'
    if (currentStep === stepId) return 'current'
    return 'upcoming'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/branches">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Import Master Data</h1>
            <p className="text-muted-foreground">
              Upload an Excel file to import branches, services, parts, staff, and operating hours.
            </p>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            {steps.map((step, index) => {
              const status = getStepStatus(step.id)
              const isLast = index === steps.length - 1

              // Nếu đang lỗi và đang ở step 2 → tô đỏ step 2
              const isErrorStep =
                result && result.success === false && step.id === 2 && currentStep === 2

              return (
                <div key={step.id} className="flex items-center gap-2 flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={[
                        'flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold',
                        status === 'completed' && 'bg-emerald-50 border-emerald-500 text-emerald-700',
                        status === 'current' && 'bg-primary text-primary-foreground border-primary',
                        status === 'upcoming' && 'bg-muted text-muted-foreground border-muted-foreground/40',
                        isErrorStep && 'bg-red-50 border-red-500 text-red-700',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {status === 'completed' ? <CheckCircle2 className="h-4 w-4" /> : step.id}
                    </div>
                    <div className="mt-2 text-center">
                      <div className="text-xs font-medium">{step.title}</div>
                      <div className="text-[11px] text-muted-foreground">{step.description}</div>
                    </div>
                  </div>
                  {!isLast && <div className="h-px flex-1 bg-muted" />}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Instructions / Template */}
      <Card>
        <CardHeader>
          <CardTitle>Template & Instructions</CardTitle>
          <CardDescription>
            Use the provided Excel template to ensure the correct sheet structure and headers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <FileSpreadsheet className="h-5 w-5 mt-0.5 text-muted-foreground" />
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                The import expects the following sheets: <b>Branch</b>, <b>BranchOperatingHour</b>,{' '}
                <b>Staff</b>, <b>ParentCategory</b>, <b>ServiceCategory</b>, <b>Service</b>,{' '}
                <b>PartCategory</b>, and <b>Part</b>.
              </p>
              <p>
                Each sheet must keep the original header names. If any sheet or header is wrong, the
                import will fail and no data will be saved.
              </p>
            </div>
          </div>
          <div>
            <Link href="/templates/master_import_template_full.xlsx">
              <Button variant="outline" size="sm">
                <DownloadIcon className="mr-2 h-4 w-4" />
                Download Template
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle>Step 1: Upload Excel File</CardTitle>
          <CardDescription>
            Select a .xlsx file that matches the template structure.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleChooseFile} disabled={isImporting}>
              <Upload className="mr-2 h-4 w-4" />
              Choose Excel File
            </Button>
            {selectedFileName && (
              <span className="text-sm text-muted-foreground">
                Selected: <span className="font-medium">{selectedFileName}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleImport} disabled={!selectedFileName || isImporting}>
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating & Importing...
                </>
              ) : (
                'Start Import (Step 2 & 3)'
              )}
            </Button>
            <span className="text-xs text-muted-foreground">
              The server will validate the template and business rules. If any error is found, no
              data will be saved.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Result / Error Summary */}
      {result && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            {result.success ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
            <div>
              <CardTitle className="text-base">
                {result.success ? 'Import completed successfully' : 'Import failed'}
              </CardTitle>
              <CardDescription>{result.message}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {!result.success && errors && errors.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium mb-2">Error details</p>
                <div className="max-h-64 overflow-auto rounded-md border bg-muted p-2 text-xs space-y-1">
                  {errors.map((err, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-red-500">•</span>
                      <span>
                        [{err.sheetName}
                        {err.rowNumber ? ` - row ${err.rowNumber}` : ''}
                        {err.columnName ? ` - ${err.columnName}` : ''}]: {err.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.success && (
              <div className="mt-4">
                <Link href="/admin/branches">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to branches
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function DownloadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  )
}
