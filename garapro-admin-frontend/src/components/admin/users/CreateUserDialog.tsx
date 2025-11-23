import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateUserDialog({ open, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    PhoneNumber: "",
    password: "Admin123!",
    role: "Manager",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://localhost:7113/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const error = await res.text();
        toast.error("Create failed: " + error);
        setLoading(false);
        return;
      }

      toast.success("User created successfully");
      onClose();
      onSuccess && onSuccess();
    } catch (err) {
      toast.error("Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-3">
          <Input
            placeholder="First Name"
            value={form.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
          />

          <Input
            placeholder="Last Name"
            value={form.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
          />

          <Input
            placeholder="Email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />

          <Input
            placeholder="Phone Number"
            value={form.PhoneNumber}
            onChange={(e) => handleChange("PhoneNumber", e.target.value)}
          />

          <Input
            type="password"
            placeholder="Admin123!"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
          />

          <Select
            value={form.role}
            onValueChange={(v) => handleChange("role", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Manager">Manager</SelectItem>
              <SelectItem value="Technician">Technician</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={loading} onClick={handleSubmit}>
            {loading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
