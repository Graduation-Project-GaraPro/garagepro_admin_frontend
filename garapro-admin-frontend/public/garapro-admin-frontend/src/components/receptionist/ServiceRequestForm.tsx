"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, Edit, Eye, Trash2, Phone, Mail } from "lucide-react";
import {
  Customer,
  Vehicle,
  ServiceRequest,
} from "@/app/pages/manager/receptionist/page";

interface ServiceRequestFormProps {
  onSubmit?: (request: Partial<ServiceRequest>) => void;
  onUpdate?: (id: string, request: Partial<ServiceRequest>) => void;
}

const ServiceRequestForm: React.FC<ServiceRequestFormProps> = ({
  onSubmit,
  onUpdate,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingRequest, setEditingRequest] = useState<ServiceRequest | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");

  // Form state
  const [formData, setFormData] = useState<{
    description: string;
    priority: "low" | "medium" | "high" | "urgent";
    estimatedCompletionDate: string;
    notes: string;
  }>({
    description: "",
    priority: "medium",
    estimatedCompletionDate: "",
    notes: "",
  });

  // Mock data – in real use, fetch from API
  useEffect(() => {
    const mockCustomers: Customer[] = [
      {
        id: "1",
        name: "Nguyen Van An",
        phone: "0901234567",
        email: "nguyenvanan@email.com",
        address: "123 ABC Street, District 1, HCMC",
        vehicles: [
          {
            id: "v1",
            licensePlate: "51A-12345",
            brand: "Toyota",
            model: "Camry",
            year: 2020,
            color: "White",
          },
        ],
      },
      {
        id: "2",
        name: "Tran Thi Binh",
        phone: "0907654321",
        email: "tranthibinh@email.com",
        address: "456 XYZ Street, District 3, HCMC",
        vehicles: [
          {
            id: "v2",
            licensePlate: "51B-67890",
            brand: "Honda",
            model: "Civic",
            year: 2019,
            color: "Black",
          },
        ],
      },
    ];

    const mockRequests: ServiceRequest[] = [
      {
        id: "sr1",
        customerId: "1",
        vehicleId: "v1",
        description: "Oil change and brake inspection",
        priority: "medium",
        status: "pending",
        createdAt: new Date("2024-01-15"),
        estimatedCompletionDate: new Date("2024-01-16"),
      },
      {
        id: "sr2",
        customerId: "2",
        vehicleId: "v2",
        description: "Repair air conditioner (not cooling)",
        priority: "high",
        status: "in-progress",
        createdAt: new Date("2024-01-14"),
        estimatedCompletionDate: new Date("2024-01-17"),
        technicianId: "tech1",
      },
    ];

    setCustomers(mockCustomers);
    setServiceRequests(mockRequests);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !selectedVehicle) return;

    const newRequest: Partial<ServiceRequest> = {
      id: editingRequest?.id || `sr${Date.now()}`,
      customerId: selectedCustomer.id,
      vehicleId: selectedVehicle.id,
      description: formData.description,
      priority: formData.priority,
      status: "pending",
      createdAt: editingRequest?.createdAt || new Date(),
      estimatedCompletionDate: formData.estimatedCompletionDate
        ? new Date(formData.estimatedCompletionDate)
        : undefined,
      notes: formData.notes,
    };

    if (editingRequest) {
      onUpdate?.(editingRequest.id, newRequest);
      setServiceRequests((prev) =>
        prev.map((req) =>
          req.id === editingRequest.id
            ? ({ ...req, ...newRequest } as ServiceRequest)
            : req
        )
      );
    } else {
      onSubmit?.(newRequest);
      setServiceRequests((prev) => [...prev, newRequest as ServiceRequest]);
    }

    // Reset form
    setFormData({
      description: "",
      priority: "medium",
      estimatedCompletionDate: "",
      notes: "",
    });
    setSelectedCustomer(null);
    setSelectedVehicle(null);
    setIsFormVisible(false);
    setEditingRequest(null);
  };

  const handleEdit = (request: ServiceRequest) => {
    const customer = customers.find((c) => c.id === request.customerId);
    const vehicle = customer?.vehicles.find((v) => v.id === request.vehicleId);

    setSelectedCustomer(customer || null);
    setSelectedVehicle(vehicle || null);
    setEditingRequest(request);
    setFormData({
      description: request.description,
      priority: request.priority,
      estimatedCompletionDate:
        request.estimatedCompletionDate?.toISOString().split("T")[0] || "",
      notes: request.notes || "",
    });
    setIsFormVisible(true);
  };

  const handleDelete = (id: string) => {
    setServiceRequests((prev) => prev.filter((req) => req.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "confirmed":
        return "bg-purple-100 text-purple-800";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredRequests = serviceRequests.filter((request) => {
    const customer = customers.find((c) => c.id === request.customerId);
    const vehicle = customer?.vehicles.find((v) => v.id === request.vehicleId);

    return (
      customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.phone.includes(searchTerm) ||
      vehicle?.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name, phone, license plate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
        </div>
        <Button
          onClick={() => {
            setIsFormVisible(true);
            setEditingRequest(null);
            setFormData({
              description: "",
              priority: "medium",
              estimatedCompletionDate: "",
              notes: "",
            });
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Service Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Service Request List</CardTitle>
          <CardDescription>
            Total {filteredRequests.length} service requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Estimated Completion</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => {
                const customer = customers.find(
                  (c) => c.id === request.customerId
                );
                const vehicle = customer?.vehicles.find(
                  (v) => v.id === request.vehicleId
                );

                return (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer?.name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {customer?.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {vehicle?.licensePlate}
                        </div>
                        <div className="text-sm text-gray-500">
                          {vehicle?.brand} {vehicle?.model} ({vehicle?.year})
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div
                        className="max-w-xs truncate"
                        title={request.description}
                      >
                        {request.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(request.priority)}>
                        {request.priority === "urgent"
                          ? "Urgent"
                          : request.priority === "high"
                          ? "High"
                          : request.priority === "medium"
                          ? "Medium"
                          : "Low"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status === "pending"
                          ? "Pending"
                          : request.status === "confirmed"
                          ? "Confirmed"
                          : request.status === "in-progress"
                          ? "In Progress"
                          : request.status === "completed"
                          ? "Completed"
                          : "Cancelled"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {request.createdAt.toLocaleDateString("en-US")}
                    </TableCell>
                    <TableCell>
                      {request.estimatedCompletionDate?.toLocaleDateString(
                        "en-US"
                      ) || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(request)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(request.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Form Dialog */}
      <Dialog open={isFormVisible} onOpenChange={setIsFormVisible}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingRequest
                ? "Edit Service Request"
                : "Create New Service Request"}
            </DialogTitle>
            <DialogDescription>
              Enter detailed information about the service request
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer</Label>
                <Select
                  value={selectedCustomer?.id || ""}
                  onValueChange={(value) => {
                    const customer = customers.find((c) => c.id === value);
                    setSelectedCustomer(customer || null);
                    setSelectedVehicle(null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        <div>
                          <div>{customer.name}</div>
                          <div className="text-sm text-gray-500">
                            {customer.phone}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicle">Vehicle</Label>
                <Select
                  value={selectedVehicle?.id || ""}
                  onValueChange={(value) => {
                    const vehicle = selectedCustomer?.vehicles.find(
                      (v) => v.id === value
                    );
                    setSelectedVehicle(vehicle || null);
                  }}
                  disabled={!selectedCustomer}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCustomer?.vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        <div>
                          <div>{vehicle.licensePlate}</div>
                          <div className="text-sm text-gray-500">
                            {vehicle.brand} {vehicle.model} ({vehicle.year})
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Problem Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe the issue in detail..."
                required
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: any) =>
                    setFormData((prev) => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedDate">Estimated Completion</Label>
                <Input
                  id="estimatedDate"
                  type="date"
                  value={formData.estimatedCompletionDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      estimatedCompletionDate: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Additional notes (if any)..."
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormVisible(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !selectedCustomer || !selectedVehicle || !formData.description
                }
              >
                {editingRequest ? "Update" : "Create Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceRequestForm;
