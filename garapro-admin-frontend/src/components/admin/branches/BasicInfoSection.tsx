import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { CreateBranchRequest } from '@/services/branch-service'

interface BasicInfoSectionProps {
  formData: CreateBranchRequest
  errors: Record<string, string>
  onChange: (field: keyof CreateBranchRequest, value: string) => void
}

// Vietnamese cities for the dropdown
const VIETNAM_CITIES = [
  'Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  'Biên Hòa',
  'Nha Trang',
  'Huế',
  'Vũng Tàu',
  'Buôn Ma Thuột'
]

// Vietnamese districts for the dropdown
const VIETNAM_DISTRICTS = [
  'Quận 1',
  'Quận 2',
  'Quận 3',
  'Quận 4',
  'Quận 5',
  'Quận 6',
  'Quận 7',
  'Quận 8',
  'Quận 9',
  'Quận 10',
  'Quận 11',
  'Quận 12',
  'Quận Bình Thạnh',
  'Quận Gò Vấp',
  'Quận Phú Nhuận',
  'Quận Tân Bình',
  'Quận Tân Phú'
]

export const BasicInfoSection = ({ 
  formData, 
  errors, 
  onChange 
}: BasicInfoSectionProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Basic Information</CardTitle>
      <CardDescription>Provide the essential details for your new branch</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Branch Name */}
      <div className="space-y-2">
        <Label htmlFor="branchName">Branch Name *</Label>
        <Input
          id="branchName"
          value={formData.branchName}
          onChange={(e) => onChange('branchName', e.target.value)}
          placeholder="e.g., Central Branch"
          className={errors.branchName ? 'border-red-500' : ''}
          data-testid="branch-name"
        />
        {errors.branchName && <p className="text-sm text-red-500">{errors.branchName}</p>}
      </div>

      {/* Address Details */}
      <div className="space-y-2">
        <Label htmlFor="street">Street Address *</Label>
        <Input
          id="street"
          value={formData.street}
          onChange={(e) => onChange('street', e.target.value)}
          placeholder="123 Main Street"
          className={errors.street ? 'border-red-500' : ''}
        />
        {errors.street && <p className="text-sm text-red-500">{errors.street}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ward">Ward *</Label>
          <Input
            id="ward"
            value={formData.ward}
            onChange={(e) => onChange('ward', e.target.value)}
            placeholder="Ward 1"
            className={errors.ward ? 'border-red-500' : ''}
          />
          {errors.ward && <p className="text-sm text-red-500">{errors.ward}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="district">District *</Label>
          <Select 
            value={formData.district} 
            onValueChange={(value) => onChange('district', value)}
          >
            <SelectTrigger className={errors.district ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select District" />
            </SelectTrigger>
            <SelectContent>
              {VIETNAM_DISTRICTS.map((district) => (
                <SelectItem key={district} value={district}>
                  {district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.district && <p className="text-sm text-red-500">{errors.district}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Select 
            value={formData.city} 
            onValueChange={(value) => onChange('city', value)}
          >
            <SelectTrigger className={errors.city ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select City" />
            </SelectTrigger>
            <SelectContent>
              {VIETNAM_CITIES.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number *</Label>
          <Input
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => onChange('phoneNumber', e.target.value)}
            placeholder="0123456789"
            className={errors.phoneNumber ? 'border-red-500' : ''}
          />
          {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
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
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Describe this branch, its services, and any special features..."
          rows={3}
        />
        <p className="text-sm text-muted-foreground">
          Optional: Provide details about this branch location and services
        </p>
      </div>
    </CardContent>
  </Card>
)