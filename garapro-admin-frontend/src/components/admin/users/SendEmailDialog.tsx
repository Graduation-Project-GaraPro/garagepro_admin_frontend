import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { User } from "@/services/user-service"
import { toast } from "sonner"   // ✅ import toast global

function SendEmailDialog({
  open,
  onOpenChange,
  user,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  user: User | null
}) {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")

  if (!user) return null

  const handleSend = () => {
    console.log("Send email to:", user.email, { subject, message })
    // gọi API gửi email tại đây...
    toast("Success", {
        description: (
          <div>
            <p className="font-semibold">Email sent</p>
            <p className="text-muted-foreground">Email has been sent to ${user.firstName}</p>
          </div>
        ) 
      })
    

    onOpenChange(false)
    setSubject("")
    setMessage("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Send Email to {user.firstName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <Textarea
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend}>Send</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
export default SendEmailDialog
