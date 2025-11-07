// components/admin/branches/BasicInfoSection.tsx
import React, { useState, useEffect, useCallback, useRef, useMemo, memo, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { LocationService, Province, Commune } from '@/services/location-service'

export type BasicField =
  | 'branchName'
  | 'phoneNumber'
  | 'email'
  | 'street'
  | 'commune'
  | 'province'
  | 'description'

interface BasicInfoSectionProps {
  branchName: string
  phoneNumber: string
  email: string
  street: string
  commune: string
  province: string
  description: string
  errors: Record<string, string>
  onChange: (field: BasicField, value: string) => void
}

/* ---------- Debounce hook ---------- */
const useDebouncedCallback = (cb: (...args: any[]) => void, delay = 250) => {
  const t = useRef<number | null>(null)
  const saved = useRef(cb)
  useEffect(() => { saved.current = cb }, [cb])

  return useCallback((...args: any[]) => {
    if (t.current) window.clearTimeout(t.current)
    t.current = window.setTimeout(() => saved.current(...args), delay)
  }, [delay])
}

/* ---------- Subcomponent: TEXT FIELDS (memo) ---------- */
const TextFields = memo(function TextFields({
  values,
  errors,
  onImmediate,      // gọi onBlur
  onDebounced,      // gọi onChange(debounced)
}: {
  values: { branchName: string; street: string; phoneNumber: string; email: string; description: string }
  errors: Record<string, string>
  onImmediate: (field: string, value: string) => void
  onDebounced: (field: string, value: string) => void
}) {
  const [isTyping, startTransition] = useTransition()

  const onChange =
    (field: keyof typeof values) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const v = e.target.value
      // update UI nhanh không block; debounce gọi parent sau
      startTransition(() => onDebounced(field, v))
    }

  return (
    <>
      {/* Branch Name */}
      <div className="space-y-2">
        <Label htmlFor="branchName">Branch Name *</Label>
        <Input
          id="branchName"
          defaultValue={values.branchName}
          onChange={onChange('branchName')}
          onBlur={(e) => onImmediate('branchName', e.target.value)}
          placeholder="e.g., Central Branch"
          className={errors.branchName ? 'border-red-500' : ''}
        />
        {errors.branchName && <p className="text-sm text-red-500">{errors.branchName}</p>}
      </div>

      {/* Street */}
      

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number *</Label>
          <Input
            id="phoneNumber"
            defaultValue={values.phoneNumber}
            onChange={onChange('phoneNumber')}
            onBlur={(e) => onImmediate('phoneNumber', e.target.value)}
            placeholder="0123456789"
            className={errors.phoneNumber ? 'border-red-500' : ''}
          />
          {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            defaultValue={values.email}
            onChange={onChange('email')}
            onBlur={(e) => onImmediate('email', e.target.value)}
            placeholder="branch@garage.com"
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          defaultValue={values.description}
          onChange={(e) => onChange('description')(e as any)}
          onBlur={(e) => onImmediate('description', (e.target as HTMLTextAreaElement).value)}
          placeholder="Describe this branch, its services, and any special features..."
          rows={3}
        />
        <p className="text-sm text-muted-foreground">
          Optional: Provide details about this branch location and services
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="street">Street Address *</Label>
        <Input
          id="street"
          defaultValue={values.street}
          onChange={onChange('street')}
          onBlur={(e) => onImmediate('street', e.target.value)}
          placeholder="Số nhà, tên đường"
          className={errors.street ? 'border-red-500' : ''}
        />
        {errors.street && <p className="text-sm text-red-500">{errors.street}</p>}
      </div>

      {/* {isTyping && <div className="text-xs text-muted-foreground">Updating…</div>} */}
    </>
  )
})

/* ---------- Subcomponent: LOCATION (memo) ---------- */
const LocationFields = memo(function LocationFields({
  provinces,
  communes,
  selectedProvinceCode,
  selectedCommuneCode,
  loadingProvinces,
  loadingCommunes,
  errors,
  onProvinceChange,
  onCommuneChange,
}: {
  provinces: Province[]
  communes: Commune[]
  selectedProvinceCode: string
  selectedCommuneCode: string
  loadingProvinces: boolean
  loadingCommunes: boolean
  errors: Record<string, string>
  onProvinceChange: (provinceCode: string) => void
  onCommuneChange: (communeCode: string) => void
}) {
  // Memo các option để không map lại mỗi lần gõ ở text
  const provinceOptions = useMemo(
    () =>
      provinces.map((p) => (
        <SelectItem key={p.idProvince} value={p.idProvince}>
          {p.name}
        </SelectItem>
      )),
    [provinces]
  )

  const communeOptions = useMemo(
    () =>
      communes.map((c) => (
        <SelectItem key={c.idCommune} value={c.idCommune}>
          {c.name}
        </SelectItem>
      )),
    [communes]
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Province */}
      <div className="space-y-2">
        <Label htmlFor="province">Province *</Label>
        <Select value={selectedProvinceCode} onValueChange={onProvinceChange} disabled={loadingProvinces}>
          <SelectTrigger className={errors.province ? 'border-red-500' : ''}>
            {loadingProvinces && provinces.length === 0 ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <SelectValue placeholder="Select Province" />
            )}
          </SelectTrigger>
          <SelectContent>{provinceOptions}</SelectContent>
        </Select>
        {errors.province && <p className="text-sm text-red-500">{errors.province}</p>}
      </div>

      {/* Commune */}
      <div className="space-y-2">
        <Label htmlFor="commune">Commune *</Label>
        <Select
          value={selectedCommuneCode}
          onValueChange={onCommuneChange}
          disabled={!selectedProvinceCode || loadingCommunes}
        >
          <SelectTrigger className={errors.commune ? 'border-red-500' : ''}>
            {loadingCommunes && selectedProvinceCode ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <SelectValue placeholder={selectedProvinceCode ? 'Select Commune' : 'Select Province First'} />
            )}
          </SelectTrigger>
          <SelectContent>{communeOptions}</SelectContent>
        </Select>
        {errors.commune && <p className="text-sm text-red-500">{errors.commune}</p>}
      </div>
    </div>
  )
})

/* ---------- Main ---------- */
function BasicInfoSectionImpl({
  branchName,
  phoneNumber,
  email,
  street,
  commune,
  province,
  description,
  errors,
  onChange,
}: BasicInfoSectionProps) {
  const serviceRef = useRef(new LocationService())

  // location state
  const [provinces, setProvinces] = useState<Province[]>([])
  const [communes, setCommunes] = useState<Commune[]>([])
  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingCommunes, setLoadingCommunes] = useState(false)
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('')
  const [selectedCommuneCode, setSelectedCommuneCode] = useState('')
  const initializedRef = useRef(false)

  // load provinces once
  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoadingProvinces(true)
      try {
        const data = await serviceRef.current.getProvinces()
        if (alive) setProvinces(data)
      } catch (e) {
        console.error('Failed to load provinces:', e)
      } finally {
        if (alive) setLoadingProvinces(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  // initialize from props province/comune once data ready
  useEffect(() => {
    if (initializedRef.current || provinces.length === 0) return

    ;(async () => {
      if (!province) {
        initializedRef.current = true
        return
      }
      const foundProvince = provinces.find(
        (p) => p.name === province || p.name.toLowerCase().includes(province.toLowerCase())
      )
      if (!foundProvince) {
        initializedRef.current = true
        return
      }

      setSelectedProvinceCode(foundProvince.idProvince)
      setLoadingCommunes(true)
      try {
        const communesData = await serviceRef.current.getCommunes(foundProvince.idProvince)
        setCommunes(communesData)
        if (commune) {
          const foundCommune = communesData.find(
            (c) => c.name === commune || c.name.toLowerCase().includes(commune.toLowerCase())
          )
          if (foundCommune) setSelectedCommuneCode(foundCommune.idCommune)
        }
      } catch (e) {
        console.error('Failed to load communes:', e)
      } finally {
        setLoadingCommunes(false)
        initializedRef.current = true
      }
    })()
  }, [provinces, province, commune])

  /* province change */
  const handleProvinceChange = useCallback(
    async (provinceCode: string) => {
      if (provinceCode === selectedProvinceCode) return
      const foundProvince = provinces.find((p) => p.idProvince === provinceCode)
      if (!foundProvince) return

      setSelectedProvinceCode(provinceCode)
      setSelectedCommuneCode('')
      if (province !== foundProvince.name) onChange('province', foundProvince.name)
      if (commune !== '') onChange('commune', '')

      setLoadingCommunes(true)
      try {
        const communesData = await serviceRef.current.getCommunes(provinceCode)
        setCommunes(communesData)
      } catch (e) {
        console.error('Failed to load communes:', e)
      } finally {
        setLoadingCommunes(false)
      }
    },
    [provinces, selectedProvinceCode, onChange, province, commune]
  )

  /* commune change */
  const handleCommuneChange = useCallback(
    (communeCode: string) => {
      if (communeCode === selectedCommuneCode) return
      const foundCommune = communes.find((c) => c.idCommune === communeCode)
      if (!foundCommune) return
      setSelectedCommuneCode(communeCode)
      if (commune !== foundCommune.name) onChange('commune', foundCommune.name)
    },
    [communes, selectedCommuneCode, commune, onChange]
  )

  /* debounce push to parent for text fields */
  const debouncedPush = useDebouncedCallback((field: string, value: string) => {
    onChange(field, value)
  }, 250)

  const onImmediate = useCallback((field: string, value: string) => onChange(field, value), [onChange])
  const onDebounced = useCallback((field: string, value: string) => debouncedPush(field, value), [debouncedPush])

  // Skeleton during first init with province prop
  if (!initializedRef.current && provinces.length > 0 && province) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Loading location data...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Initializing location data...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>Provide the essential details for your branch</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* TEXT FIELDS — tách riêng để gõ không làm render lại options */}
        <TextFields
          values={{ branchName, street, phoneNumber, email, description }}
          errors={{
            branchName: errors.branchName,
            street: errors.street,
            phoneNumber: errors.phoneNumber,
            email: errors.email,
            description: errors.description,
          }}
          onImmediate={onImmediate}
          onDebounced={onDebounced}
        />

        {/* LOCATION — render nặng được tách và memo */}
        <LocationFields
          provinces={provinces}
          communes={communes}
          selectedProvinceCode={selectedProvinceCode}
          selectedCommuneCode={selectedCommuneCode}
          loadingProvinces={loadingProvinces}
          loadingCommunes={loadingCommunes}
          errors={{ province: errors.province, commune: errors.commune }}
          onProvinceChange={handleProvinceChange}
          onCommuneChange={handleCommuneChange}
        />
      </CardContent>
    </Card>
  )
}

/* ---------- Memo comparator ---------- */
export const BasicInfoSection = memo(
  BasicInfoSectionImpl,
  (prev, next) =>
    prev.branchName === next.branchName &&
    prev.phoneNumber === next.phoneNumber &&
    prev.email === next.email &&
    prev.street === next.street &&
    prev.commune === next.commune &&
    prev.province === next.province &&
    prev.description === next.description &&
    prev.errors.branchName === next.errors.branchName &&
    prev.errors.phoneNumber === next.errors.phoneNumber &&
    prev.errors.email === next.errors.email &&
    prev.errors.street === next.errors.street &&
    prev.errors.commune === next.errors.commune &&
    prev.errors.province === next.errors.province &&
    prev.errors.description === next.errors.description &&
    prev.onChange === next.onChange
)
