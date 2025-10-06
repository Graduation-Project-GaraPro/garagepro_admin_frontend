// components/registration/PhoneInputStep.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Phone } from 'lucide-react';
import { authService } from '@/services/authService';

interface PhoneInputStepProps {
  onSubmit: (phoneNumber: string) => void;
  isLoading: boolean;
  initialPhoneNumber: string;
}

export function PhoneInputStep({ onSubmit, isLoading, initialPhoneNumber }: PhoneInputStepProps) {
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [error, setError] = useState('');

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^(0|\+84)(3[2-9]|5[2689]|7[06-9]|8[1-689]|9[0-9])[0-9]{7}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phoneNumber.trim()) {
      setError('Please enter phone number');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError('Invalid phone number');
      return;
    }

    try {
      await authService.sendOtp({ phoneNumber });
      onSubmit(phoneNumber);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error sending OTP');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="Enter phone number"
            className="pl-10"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={isLoading}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <p className="text-xs text-muted-foreground">
          We will send a 6-digit OTP code to this phone number
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending OTP...
          </>
        ) : (
          'Send OTP Code'
        )}
      </Button>
    </form>
  );
}