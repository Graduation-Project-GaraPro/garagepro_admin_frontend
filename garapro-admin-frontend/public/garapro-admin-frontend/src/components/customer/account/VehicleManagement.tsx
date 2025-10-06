"use client";

import { useState } from "react";
import { Car, Edit, Trash, Plus } from "lucide-react";

interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  vin: string;
}

export function VehicleManagement() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: 1,
      make: "Toyota",
      model: "Camry",
      year: 2020,
      licensePlate: "51F-123.45",
      color: "Trắng",
      vin: "1HGCM82633A123456",
    },
    {
      id: 2,
      make: "Honda",
      model: "Civic",
      year: 2019,
      licensePlate: "59A-678.90",
      color: "Đen",
      vin: "2HGFG12567H123456",
    },
  ]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    licensePlate: "",
    color: "",
    vin: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNew = () => {
    setFormData({
      make: "",
      model: "",
      year: new Date().getFullYear(),
      licensePlate: "",
      color: "",
      vin: "",
    });
    setEditingVehicle(null);
    setShowAddForm(true);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setFormData({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      licensePlate: vehicle.licensePlate,
      color: vehicle.color,
      vin: vehicle.vin,
    });
    setEditingVehicle(vehicle);
    setShowAddForm(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa xe này?")) {
      setVehicles(prev => prev.filter(vehicle => vehicle.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingVehicle) {
      // Cập nhật xe hiện có
      setVehicles(prev =>
        prev.map(vehicle =>
          vehicle.id === editingVehicle.id
            ? { ...vehicle, ...formData }
            : vehicle
        )
      );
    } else {
      // Thêm xe mới
      const newVehicle: Vehicle = {
        id: Date.now(),
        ...formData,
        year: Number(formData.year),
      };
      setVehicles(prev => [...prev, newVehicle]);
    }
    
    setShowAddForm(false);
    setEditingVehicle(null);
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Xe của tôi</h2>
        <button
          onClick={handleAddNew}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-1" /> Thêm xe
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 border rounded-lg">
          <h3 className="text-lg font-medium mb-3">
            {editingVehicle ? "Chỉnh sửa thông tin xe" : "Thêm xe mới"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-1">
                  Hãng xe
                </label>
                <input
                  type="text"
                  id="make"
                  name="make"
                  value={formData.make}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                  Mẫu xe
                </label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                  Năm sản xuất
                </label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                  min={1900}
                  max={new Date().getFullYear() + 1}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700 mb-1">
                  Biển số xe
                </label>
                <input
                  type="text"
                  id="licensePlate"
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                  Màu sắc
                </label>
                <input
                  type="text"
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="vin" className="block text-sm font-medium text-gray-700 mb-1">
                Số khung (VIN)
              </label>
              <input
                type="text"
                id="vin"
                name="vin"
                value={formData.vin}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingVehicle ? "Cập nhật" : "Thêm"}
              </button>
            </div>
          </form>
        </div>
      )}

      {vehicles.length === 0 ? (
        <div className="text-center py-8">
          <Car className="w-12 h-12 mx-auto text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Không có xe</h3>
          <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng cách thêm xe đầu tiên của bạn.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {vehicles.map(vehicle => (
            <div key={vehicle.id} className="p-4 border rounded-lg flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-start space-x-3">
                <Car className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-medium">{vehicle.make} {vehicle.model} {vehicle.year}</h3>
                  <p className="text-sm text-gray-600">Biển số: {vehicle.licensePlate}</p>
                  <p className="text-sm text-gray-600">Màu: {vehicle.color}</p>
                  {vehicle.vin && <p className="text-sm text-gray-600">VIN: {vehicle.vin}</p>}
                </div>
              </div>
              
              <div className="flex space-x-2 mt-3 md:mt-0">
                <button
                  onClick={() => handleEdit(vehicle)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(vehicle.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}