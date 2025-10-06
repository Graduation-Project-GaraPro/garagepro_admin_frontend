// components/registration/OtpVerificationStep.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, RotateCcw } from 'lucide-react';
import { authService } from '@/services/authService';

interface OtpVerificationStepProps {
  phoneNumber: string;
  onVerify: (otp: string) => void;
  onBack: () => void;
  isLoading: boolean;
}

export function OtpVerificationStep({ 
  phoneNumber, 
  onVerify, 
  onBack, 
  isLoading 
}: OtpVerificationStepProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      focusInput(index + 1);
    }

    setError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      focusInput(index - 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('').slice(0, 6);
      setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')]);
      focusInput(Math.min(5, pastedData.length - 1));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');

    if (otpString.length !== 6) {
      setError('Please enter all 6 OTP digits');
      return;
    }

    try {
      await authService.verifyOtp({ phoneNumber, token: otpString });
      onVerify(otpString);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Invalid OTP code');
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setCanResend(false);
    setCountdown(60);
    setOtp(['', '', '', '', '', '']);
    
    try {
      await authService.sendOtp({ phoneNumber });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error resending OTP');
      setCanResend(true);
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
        <div className="space-y-2">
          <Label>OTP Code</Label>
          <div className="flex space-x-2 justify-center">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-12 text-center text-lg font-semibold"
                disabled={isLoading}
              />
            ))}
          </div>
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            {canResend ? (
              <Button
                variant="link"
                onClick={handleResendOtp}
                className="p-0 h-auto"
                disabled={isLoading}
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                Resend OTP
              </Button>
            ) : (
              `Resend OTP in ${countdown}s`
            )}
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify OTP'
          )}
        </Button>
      </form>
    </div>
  );
}