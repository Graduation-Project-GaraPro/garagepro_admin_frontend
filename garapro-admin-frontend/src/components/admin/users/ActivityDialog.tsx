import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Activity } from "lucide-react"; // icon

import { User } from "@/services/user-service";

function ActivityDialog({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: User | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Account Activity - {user?.fullName ?? "Unknown"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {user?.details?.accountHistory?.length ? (
            user.details.accountHistory.map((activity, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {activity.action}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>{new Date(activity.date).toLocaleDateString()}</span>
                  <span>{activity.ip}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No activity found.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ActivityDialog;
