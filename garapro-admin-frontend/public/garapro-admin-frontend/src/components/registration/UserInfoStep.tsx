// components/registration/UserInfoStep.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { RegistrationData } from './RegistrationForm';

interface UserInfoStepProps {
  onSubmit: (data: Omit<RegistrationData, 'phoneNumber' | 'otp'>) => void;
  onBack: () => void;
  isLoading: boolean;
  initialData: RegistrationData;
  apiErrors?: string[];
}

export function UserInfoStep({ onSubmit, onBack, isLoading, initialData, apiErrors = [] }: UserInfoStepProps) {
  const [formData, setFormData] = useState({
    firstName: initialData.firstName,
    lastName: initialData.lastName,
    email: initialData.email,
    password: initialData.password,
    confirmPassword: initialData.confirmPassword,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle API errors
  useEffect(() => {
    if (apiErrors.length > 0) {
      const fieldErrors: Record<string, string> = {};
      
      apiErrors.forEach(error => {
        const lowerError = error.toLowerCase();
        
        if (lowerError.includes('password') && lowerError.includes('uppercase')) {
          fieldErrors.password = 'Password must contain at least one uppercase letter';
        } else if (lowerError.includes('password') && lowerError.includes('lowercase')) {
          fieldErrors.password = 'Password must contain at least one lowercase letter';
        } else if (lowerError.includes('password') && lowerError.includes('digit')) {
          fieldErrors.password = 'Password must contain at least one digit';
        } else if (lowerError.includes('password') && lowerError.includes('non-alphanumeric')) {
          fieldErrors.password = 'Password must contain at least one special character';
        } else if (lowerError.includes('password') && lowerError.includes('length')) {
          fieldErrors.password = 'Password does not meet length requirements';
        } else if (lowerError.includes('email') && lowerError.includes('duplicate')) {
          fieldErrors.email = 'This email is already in use';
        } else if (lowerError.includes('email')) {
          fieldErrors.email = 'Invalid email address';
        } else if (lowerError.includes('user') && lowerError.includes('name')) {
          // Handle errors for firstName/lastName
          if (lowerError.includes('first')) {
            fieldErrors.firstName = 'Invalid first name';
          } else if (lowerError.includes('last')) {
            fieldErrors.lastName = 'Invalid last name';
          }
        }
      });

      setErrors(prev => ({ ...prev, ...fieldErrors }));
    }
  }, [apiErrors]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Please enter first name';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Please enter last name';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="px-0"
        disabled={isLoading}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="lastName"
                placeholder="Enter last name"
                className="pl-10"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                disabled={isLoading}
              />
            </div>
            {errors.lastName && <p className="text-sm text-red-600">{errors.lastName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              placeholder="Enter first name"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              disabled={isLoading}
            />
            {errors.firstName && <p className="text-sm text-red-600">{errors.firstName}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email (optional)</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="Enter email"
              className="pl-10"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              disabled={isLoading}
            />
          </div>
          {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password"
              className="pl-10 pr-10"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password *</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm password"
              className="pl-10 pr-10"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Complete Registration'
          )}
        </Button>
      </form>
    </div>
  );
}