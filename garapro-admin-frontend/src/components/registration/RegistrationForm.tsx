// components/registration/RegistrationForm.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PhoneInputStep } from '@/components/registration/PhoneInputStep';
import { OtpVerificationStep } from '@/components/registration/OtpVerificationStep';
import { UserInfoStep } from '@/components/registration/UserInfoStep';
import { SuccessStep } from '@/components/registration/SuccessStep';
import { authService } from '@/services/authService';

export type RegistrationStep = 'phone' | 'otp' | 'user-info' | 'success';

export interface RegistrationData {
  phoneNumber: string;
  otp: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function RegistrationForm() {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('phone');
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    phoneNumber: '',
    otp: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [apiErrors, setApiErrors] = useState<string[]>([]);

  const updateRegistrationData = (data: Partial<RegistrationData>) => {
    setRegistrationData(prev => ({ ...prev, ...data }));
  };

  const handlePhoneSubmit = async (phoneNumber: string) => {
    setIsLoading(true);
    setApiErrors([]); // Clear errors when starting new step
    try {
      updateRegistrationData({ phoneNumber });
      setCurrentStep('otp');
    } catch (error) {
      console.error('Error sending OTP:', error);
      setApiErrors(['Error sending OTP. Please try again.']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerify = async (otp: string) => {
    setIsLoading(true);
    setApiErrors([]);
    try {
      updateRegistrationData({ otp });
      setCurrentStep('user-info');
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setApiErrors(['Invalid OTP code. Please try again.']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserInfoSubmit = async (userData: Omit<RegistrationData, 'phoneNumber' | 'otp'>) => {
    setIsLoading(true);
    setApiErrors([]);
    
    try {
      updateRegistrationData(userData);

      // Call complete registration API with full data
      await authService.completeRegistration({
        ...userData,
        phoneNumber: registrationData.phoneNumber,
        otp: registrationData.otp
      });

      setCurrentStep('success');
    } catch (error) {
      console.error('Error completing registration:', error);
      
      // Handle errors from API
      if (error instanceof Error) {
        // If error.message is a string containing JSON
        try {
          const errorData = JSON.parse(error.message);
          if (errorData.errors && Array.isArray(errorData.errors)) {
            setApiErrors(errorData.errors);
          } else {
            setApiErrors([error.message || 'An error occurred during registration']);
          }
        } catch {
          // If not JSON, display message directly
          setApiErrors([error.message || 'An error occurred during registration']);
        }
      } else {
        setApiErrors(['An error occurred during registration']);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setApiErrors([]); // Clear errors when going back
    if (currentStep === 'otp') {
      setCurrentStep('phone');
    } else if (currentStep === 'user-info') {
      setCurrentStep('otp');
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'phone':
        return 'Create Account';
      case 'otp':
        return 'OTP Verification';
      case 'user-info':
        return 'Personal Information';
      case 'success':
        return 'Registration Successful';
      default:
        return 'Create Account';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'phone':
        return 'Enter your phone number to receive OTP code';
      case 'otp':
        return `Enter OTP code sent to ${registrationData.phoneNumber}`;
      case 'user-info':
        return 'Complete your personal information';
      case 'success':
        return 'Your account has been created successfully';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">{getStepTitle()}</CardTitle>
          <CardDescription className="text-center">
            {getStepDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Display general API errors */}
          {apiErrors.length > 0 && currentStep !== 'success' && (
            <div className="mb-4 p-3 border border-red-200 bg-red-50 rounded-md">
              <h4 className="text-sm font-medium text-red-800 mb-1">
                Errors occurred:
              </h4>
              <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                {apiErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {currentStep === 'phone' && (
            <PhoneInputStep
              onSubmit={handlePhoneSubmit}
              isLoading={isLoading}
              initialPhoneNumber={registrationData.phoneNumber}
            />
          )}

          {currentStep === 'otp' && (
            <OtpVerificationStep
              phoneNumber={registrationData.phoneNumber}
              onVerify={handleOtpVerify}
              onBack={handleBack}
              isLoading={isLoading}
            />
          )}

          {currentStep === 'user-info' && (
            <UserInfoStep
              onSubmit={handleUserInfoSubmit}
              onBack={handleBack}
              isLoading={isLoading}
              initialData={registrationData}
              apiErrors={apiErrors}
            />
          )}

          {currentStep === 'success' && (
            <SuccessStep
              phoneNumber={registrationData.phoneNumber}
              firstName={registrationData.firstName}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}