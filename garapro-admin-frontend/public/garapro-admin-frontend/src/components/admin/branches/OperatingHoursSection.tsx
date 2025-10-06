import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { OperatingHour } from '@/services/branch-service'

interface OperatingHoursSectionProps {
  operatingHours: OperatingHour[]
  onOperatingHoursChange: (day: string, field: keyof OperatingHour, value: string | boolean) => void
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
  onOperatingHoursChange 
}: OperatingHoursSectionProps) => {
  // Sort operating hours by day of week
  const sortedOperatingHours = [...operatingHours].sort((a, b) => a.dayOfWeek - b.dayOfWeek)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Operating Hours</CardTitle>
        <CardDescription>Set the operating hours for each day of the week</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedOperatingHours.map((hours) => (
            <div key={hours.dayOfWeek} className="flex items-center gap-4 p-3 border rounded-lg">
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
                    <Label htmlFor={`day-${hours.dayOfWeek}-open`} className="text-sm whitespace-nowrap">
                      Open:
                    </Label>
                    <Input
                      id={`day-${hours.dayOfWeek}-open`}
                      type="time"
                      value={hours.openTime}
                      onChange={(e) => 
                        onOperatingHoursChange(hours.dayOfWeek.toString(), 'openTime', e.target.value)
                      }
                      className="w-32"
                      aria-label={`${DAY_NAMES[hours.dayOfWeek]} opening time`}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`day-${hours.dayOfWeek}-close`} className="text-sm whitespace-nowrap">
                      Close:
                    </Label>
                    <Input
                      id={`day-${hours.dayOfWeek}-close`}
                      type="time"
                      value={hours.closeTime}
                      onChange={(e) => 
                        onOperatingHoursChange(hours.dayOfWeek.toString(), 'closeTime', e.target.value)
                      }
                      className="w-32"
                      aria-label={`${DAY_NAMES[hours.dayOfWeek]} closing time`}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Summary */}
        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm font-medium text-blue-800">Operating Days Summary</div>
          <div className="text-sm text-blue-600 mt-1">
            {operatingHours.filter(h => h.isOpen).length} out of 7 days open
          </div>
        </div>
      </CardContent>
    </Card>
  )
}