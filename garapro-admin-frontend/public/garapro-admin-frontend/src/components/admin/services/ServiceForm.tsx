// components/services/ServiceForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Service, ServiceType, Part, Branch } from '@/types/service';
import { serviceService } from '@/services/service-Service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface ServiceFormProps {
  service?: Service;
}

export default function ServiceForm({ service }: ServiceFormProps) {
  const router = useRouter();
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedParts, setSelectedParts] = useState<{ partId: string; quantity: number }[]>([]);
  const [newPart, setNewPart] = useState({ partId: '', quantity: 1 });
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    serviceTypeId: service?.serviceTypeId || '',
    basePrice: service?.basePrice || 0,
    estimatedDuration: service?.estimatedDuration || 30,
    isActive: service?.isActive || true,
    branchIds: service?.branchIds || []
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (service?.parts) {
      setSelectedParts(service.parts.map(ps => ({
        partId: ps.partId,
        quantity: ps.quantity
      })));
    }
  }, [service]);

  const loadData = async () => {
    try {
      const [types, partsData, branchesData] = await Promise.all([
        serviceService.getServiceTypes(),
        serviceService.getParts(),
        serviceService.getBranches()
      ]);

      setServiceTypes(types);
      setParts(partsData);
      setBranches(branchesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load form data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let result;
      
      if (service) {
        // Update existing service
        result = await serviceService.updateService(service.id, formData);
      } else {
        // Create new service
        result = await serviceService.createService(formData);
      }

      if (result) {
        // Add parts to service
        for (const part of selectedParts) {
          await serviceService.addPartToService(result.id, part.partId, part.quantity);
        }

        toast.success(service ? 'Service updated successfully' : 'Service created successfully');
        router.push('/admin/services');
        router.refresh();
      } else {
        toast.error('Failed to save service');
      }
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Failed to save service');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addPart = () => {
    if (!newPart.partId) return;

    const existingPart = selectedParts.find(p => p.partId === newPart.partId);
    if (existingPart) {
      setSelectedParts(selectedParts.map(p =>
        p.partId === newPart.partId
          ? { ...p, quantity: p.quantity + newPart.quantity }
          : p
      ));
    } else {
      setSelectedParts([...selectedParts, newPart]);
    }

    setNewPart({ partId: '', quantity: 1 });
  };

  const removePart = (partId: string) => {
    setSelectedParts(selectedParts.filter(p => p.partId !== partId));
  };

  const toggleBranch = (branchId: string) => {
    setFormData(prev => ({
      ...prev,
      branchIds: prev.branchIds.includes(branchId)
        ? prev.branchIds.filter(id => id !== branchId)
        : [...prev.branchIds, branchId]
    }));
  };

  if (isLoading) {
    return <div>Loading form...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/services">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">
          {service ? 'Edit Service' : 'Create New Service'}
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
              <CardDescription>
                Basic information about the service
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceTypeId">Service Type</Label>
                <Select
                  value={formData.serviceTypeId}
                  onValueChange={(value) => setFormData({ ...formData, serviceTypeId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Base Price ($)</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedDuration">Duration (minutes)</Label>
                  <Input
                    id="estimatedDuration"
                    type="number"
                    min="1"
                    value={formData.estimatedDuration}
                    onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active Service</Label>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Required Parts</CardTitle>
                <CardDescription>
                  Parts needed for this service
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Select
                    value={newPart.partId}
                    onValueChange={(value) => setNewPart({ ...newPart, partId: value })}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select part" />
                    </SelectTrigger>
                    <SelectContent>
                      {parts.map((part) => (
                        <SelectItem key={part.id} value={part.id}>
                          {part.name} - ${part.price.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="1"
                    value={newPart.quantity}
                    onChange={(e) => setNewPart({ ...newPart, quantity: parseInt(e.target.value) })}
                    className="w-20"
                  />
                  <Button type="button" onClick={addPart}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {selectedParts.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Part</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedParts.map(({ partId, quantity }) => {
                        const part = parts.find(p => p.id === partId);
                        return (
                          <TableRow key={partId}>
                            <TableCell>{part?.name}</TableCell>
                            <TableCell>{quantity}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removePart(partId)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Available Branches</CardTitle>
                <CardDescription>
                  Select branches where this service is offered
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {branches.map((branch) => (
                    <Badge
                      key={branch.id}
                      variant={formData.branchIds.includes(branch.id) ? "default" : "outline"}
                      className="cursor-pointer px-3 py-1"
                      onClick={() => toggleBranch(branch.id)}
                    >
                      {branch.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Service
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}