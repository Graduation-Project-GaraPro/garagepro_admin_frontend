import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { OperatingHour } from '@/services/branch-service'
import { AlertCircle } from 'lucide-react' // Thêm icon cho lỗi
import { cn } from '@/lib/utils' // Thêm utility class

interface OperatingHoursSectionProps {
  operatingHours: OperatingHour[]
  onOperatingHoursChange: (day: string, field: keyof OperatingHour, value: string | boolean) => void
  error?: string // Thêm prop error
}

const DAY_NAMES: { [key: number]: string } = {
  1: 'Monday',
  2: 'Tuesday', 
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday'
}

export const OperatingHoursSection = ({ 
  operatingHours,
  onOperatingHoursChange,
  error // Nhận prop error
}: OperatingHoursSectionProps) => {
  // Sort operating hours by day of week
  const sortedOperatingHours = [...operatingHours].sort((a, b) => a.dayOfWeek - b.dayOfWeek)
  
  // Tính toán số ngày mở
  const openDaysCount = operatingHours.filter(h => h.isOpen).length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Operating Hours</CardTitle>
        <CardDescription>Set the operating hours for each day of the week</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Hiển thị lỗi nếu có */}
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          {sortedOperatingHours.map((hours) => {
            // Kiểm tra xem ngày này có lỗi về thời gian không
            const hasTimeError = hours.isOpen && (!hours.openTime?.trim() || !hours.closeTime?.trim())
            
            return (
              <div 
                key={hours.dayOfWeek} 
                className={cn(
                  "flex items-center gap-4 p-3 border rounded-lg transition-colors",
                  hasTimeError && "border-red-300 bg-red-50",
                  !hasTimeError && "hover:bg-gray-50"
                )}
              >
                <div className="w-32 font-medium">{DAY_NAMES[hours.dayOfWeek]}</div>
                
                <div className="flex items-center gap-2">
                  <Label htmlFor={`day-${hours.dayOfWeek}-switch`} className="text-sm">
                    {hours.isOpen ? 'Open' : 'Closed'}
                  </Label>
                  <Switch
                    id={`day-${hours.dayOfWeek}-switch`}
                    checked={hours.isOpen}
                    onCheckedChange={(checked) => 
                      onOperatingHoursChange(hours.dayOfWeek.toString(), 'isOpen', checked)
                    }
                    aria-label={`${DAY_NAMES[hours.dayOfWeek]} operating hours toggle`}
                  />
                </div>

                {hours.isOpen && (
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2">
                      <Label 
                        htmlFor={`day-${hours.dayOfWeek}-open`} 
                        className={cn("text-sm whitespace-nowrap", !hours.openTime?.trim() && "text-red-600")}
                      >
                        Open:
                      </Label>
                      <Input
                        id={`day-${hours.dayOfWeek}-open`}
                        type="time"
                        value={hours.openTime}
                        onChange={(e) => 
                          onOperatingHoursChange(hours.dayOfWeek.toString(), 'openTime', e.target.value)
                        }
                        className={cn("w-32", !hours.openTime?.trim() && "border-red-500")}
                        aria-label={`${DAY_NAMES[hours.dayOfWeek]} opening time`}
                        required={hours.isOpen}
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Label 
                        htmlFor={`day-${hours.dayOfWeek}-close`} 
                        className={cn("text-sm whitespace-nowrap", !hours.closeTime?.trim() && "text-red-600")}
                      >
                        Close:
                      </Label>
                      <Input
                        id={`day-${hours.dayOfWeek}-close`}
                        type="time"
                        value={hours.closeTime}
                        onChange={(e) => 
                          onOperatingHoursChange(hours.dayOfWeek.toString(), 'closeTime', e.target.value)
                        }
                        className={cn("w-32", !hours.closeTime?.trim() && "border-red-500")}
                        aria-label={`${DAY_NAMES[hours.dayOfWeek]} closing time`}
                        required={hours.isOpen}
                      />
                    </div>

                    {/* Hiển thị cảnh báo cho ngày có lỗi thời gian */}
                    {hasTimeError && (
                      <div className="flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        {!hours.openTime?.trim() && !hours.closeTime?.trim() 
                          ? "Open and close time required" 
                          : !hours.openTime?.trim() 
                            ? "Open time required" 
                            : "Close time required"
                        }
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        {/* Summary */}
        <div className={cn(
          "mt-6 p-3 border rounded-lg transition-colors",
          openDaysCount === 0 
            ? "bg-red-50 border-red-200 text-red-800" 
            : "bg-blue-50 border-blue-200 text-blue-800"
        )}>
          <div className="text-sm font-medium">Operating Days Summary</div>
          <div className="text-sm mt-1">
            {openDaysCount === 0 ? (
              <span className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                No days open - at least one day must be open
              </span>
            ) : (
              `${openDaysCount} out of 7 days open`
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}