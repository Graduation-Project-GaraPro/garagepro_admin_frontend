// components/registration/SuccessStep.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SuccessStepProps {
  phoneNumber: string;
  firstName: string;
}

export function SuccessStep({ phoneNumber, firstName }: SuccessStepProps) {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <CheckCircle2 className="h-16 w-16 text-green-600" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Registration Successful!</h3>
        <p className="text-muted-foreground">
          Welcome {firstName || 'you'} to our service.
        </p>
        <p className="text-sm text-muted-foreground">
          Account: {phoneNumber}
        </p>
      </div>

      <div className="space-y-3">
        <Button onClick={handleLogin} className="w-full">
          <LogIn className="mr-2 h-4 w-4" />
          Login Now
        </Button>
        
        <Button variant="outline" onClick={() => router.push('/')} className="w-full">
          Back to Homepage
        </Button>
      </div>
    </div>
  );
}