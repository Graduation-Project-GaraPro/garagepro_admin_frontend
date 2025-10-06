// components/receptionist/CustomerManagement.tsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Edit,
  Eye,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Car,
  User,
  Calendar,
} from "lucide-react";
import { Customer, Vehicle } from "@/app/(pages)/(user)/receptionist/page";

interface CustomerManagementProps {
  onCustomerSelect?: (customer: Customer) => void;
}

const CustomerManagement: React.FC<CustomerManagementProps> = ({
  onCustomerSelect,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Form states
  const [customerForm, setCustomerForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const [vehicleForm, setVehicleForm] = useState({
    licensePlate: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
  });

  // Mock data
  useEffect(() => {
    const mockCustomers: Customer[] = [
      {
        id: "1",
        name: "Nguyen Van An",
        phone: "0901234567",
        email: "nguyenvanan@email.com",
        address: "123 ABC Street, District 1, Ho Chi Minh City",
        vehicles: [
          {
            id: "v1",
            licensePlate: "51A-12345",
            brand: "Toyota",
            model: "Camry",
            year: 2020,
            color: "White",
          },
          {
            id: "v1b",
            licensePlate: "51A-54321",
            brand: "Honda",
            model: "CR-V",
            year: 2021,
            color: "Black",
          },
        ],
      },
      {
        id: "2",
        name: "Tran Thi Binh",
        phone: "0907654321",
        email: "tranthibinh@email.com",
        address: "456 XYZ Street, District 3, Ho Chi Minh City",
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
      {
        id: "3",
        name: "Le Van Cuong",
        phone: "0912345678",
        email: "levanvuong@email.com",
        address: "789 DEF Street, District 7, Ho Chi Minh City",
        vehicles: [
          {
            id: "v3",
            licensePlate: "51C-11111",
            brand: "Mazda",
            model: "CX-5",
            year: 2022,
            color: "Blue",
          },
        ],
      },
    ];

    setCustomers(mockCustomers);
  }, []);

  // Filter customers
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.vehicles.some((vehicle) =>
        vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  // Handle customer form
  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCustomer) {
      setCustomers((prev) =>
        prev.map((customer) =>
          customer.id === editingCustomer.id
            ? { ...customer, ...customerForm }
            : customer
        )
      );
    } else {
      const newCustomer: Customer = {
        id: `c${Date.now()}`,
        ...customerForm,
        vehicles: [],
      };
      setCustomers((prev) => [...prev, newCustomer]);
    }

    setCustomerForm({ name: "", phone: "", email: "", address: "" });
    setEditingCustomer(null);
    setIsCustomerDialogOpen(false);
  };

  // Handle vehicle form
  const handleVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    if (editingVehicle) {
      setCustomers((prev) =>
        prev.map((customer) =>
          customer.id === selectedCustomer.id
            ? {
                ...customer,
                vehicles: customer.vehicles.map((vehicle) =>
                  vehicle.id === editingVehicle.id
                    ? { ...vehicle, ...vehicleForm }
                    : vehicle
                ),
              }
            : customer
        )
      );
    } else {
      const newVehicle: Vehicle = {
        id: `v${Date.now()}`,
        ...vehicleForm,
      };

      setCustomers((prev) =>
        prev.map((customer) =>
          customer.id === selectedCustomer.id
            ? { ...customer, vehicles: [...customer.vehicles, newVehicle] }
            : customer
        )
      );
    }

    setVehicleForm({
      licensePlate: "",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      color: "",
    });
    setEditingVehicle(null);
    setIsVehicleDialogOpen(false);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setCustomerForm({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address || "",
    });
    setIsCustomerDialogOpen(true);
  };

  const handleDeleteCustomer = (customerId: string) => {
    setCustomers((prev) =>
      prev.filter((customer) => customer.id !== customerId)
    );
  };

  const handleAddVehicle = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditingVehicle(null);
    setVehicleForm({
      licensePlate: "",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      color: "",
    });
    setIsVehicleDialogOpen(true);
  };

  const handleEditVehicle = (customer: Customer, vehicle: Vehicle) => {
    setSelectedCustomer(customer);
    setEditingVehicle(vehicle);
    setVehicleForm({
      licensePlate: vehicle.licensePlate,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
    });
    setIsVehicleDialogOpen(true);
  };

  const handleDeleteVehicle = (customerId: string, vehicleId: string) => {
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === customerId
          ? {
              ...customer,
              vehicles: customer.vehicles.filter((v) => v.id !== vehicleId),
            }
          : customer
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-80"
          />
        </div>
        <Button
          onClick={() => {
            setEditingCustomer(null);
            setCustomerForm({ name: "", phone: "", email: "", address: "" });
            setIsCustomerDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
          <CardDescription>
            Total {filteredCustomers.length} customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Info</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Vehicles</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {customer.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {customer.id}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Phone className="h-3 w-3 mr-2 text-gray-400" />
                        {customer.phone}
                      </div>
                      <div className="flex items-center text-sm">
                        <Mail className="h-3 w-3 mr-2 text-gray-400" />
                        {customer.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-start text-sm">
                      <MapPin className="h-3 w-3 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">
                        {customer.address || "Not updated"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {customer.vehicles.length > 0 ? (
                        customer.vehicles.map((vehicle) => (
                          <div
                            key={vehicle.id}
                            className="flex items-center space-x-2"
                          >
                            <Badge variant="outline" className="text-xs">
                              {vehicle.licensePlate}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {vehicle.brand} {vehicle.model}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-sm text-gray-400">
                          No vehicle
                        </span>
                      )}
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs"
                        onClick={() => handleAddVehicle(customer)}
                      >
                        + Add Vehicle
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCustomer(customer)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onCustomerSelect?.(customer)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCustomer(customer.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Customer Form Dialog */}
      <Dialog
        open={isCustomerDialogOpen}
        onOpenChange={setIsCustomerDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? "Edit Customer" : "Add New Customer"}
            </DialogTitle>
            <DialogDescription>
              Enter detailed customer information
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCustomerSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Full Name *</Label>
              <Input
                id="customerName"
                value={customerForm.name}
                onChange={(e) =>
                  setCustomerForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone Number *</Label>
                <Input
                  id="customerPhone"
                  value={customerForm.phone}
                  onChange={(e) =>
                    setCustomerForm((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="0901234567"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={customerForm.email}
                  onChange={(e) =>
                    setCustomerForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerAddress">Address</Label>
              <Input
                id="customerAddress"
                value={customerForm.address}
                onChange={(e) =>
                  setCustomerForm((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                placeholder="House number, street, district, city"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCustomerDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingCustomer ? "Update" : "Add Customer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Vehicle Form Dialog */}
      <Dialog open={isVehicleDialogOpen} onOpenChange={setIsVehicleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
            </DialogTitle>
            <DialogDescription>
              Add vehicle for customer: {selectedCustomer?.name}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleVehicleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="licensePlate">License Plate *</Label>
              <Input
                id="licensePlate"
                value={vehicleForm.licensePlate}
                onChange={(e) =>
                  setVehicleForm((prev) => ({
                    ...prev,
                    licensePlate: e.target.value,
                  }))
                }
                placeholder="51A-12345"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Brand *</Label>
                <Input
                  id="brand"
                  value={vehicleForm.brand}
                  onChange={(e) =>
                    setVehicleForm((prev) => ({
                      ...prev,
                      brand: e.target.value,
                    }))
                  }
                  placeholder="Toyota, Honda, Mazda..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  value={vehicleForm.model}
                  onChange={(e) =>
                    setVehicleForm((prev) => ({
                      ...prev,
                      model: e.target.value,
                    }))
                  }
                  placeholder="Camry, Civic, CX-5..."
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Manufacture Year *</Label>
                <Input
                  id="year"
                  type="number"
                  value={vehicleForm.year}
                  onChange={(e) =>
                    setVehicleForm((prev) => ({
                      ...prev,
                      year: parseInt(e.target.value),
                    }))
                  }
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={vehicleForm.color}
                  onChange={(e) =>
                    setVehicleForm((prev) => ({
                      ...prev,
                      color: e.target.value,
                    }))
                  }
                  placeholder="White, Black, Blue..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsVehicleDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingVehicle ? "Update" : "Add Vehicle"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerManagement;
