// app/forgot-password/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { publicAuthService } from "@/services/publicAuthService";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

type Step = 1 | 2 | 3;

interface Step1Form {
  phoneNumber: string;
}

interface Step2Form {
  otp: string;
}

interface Step3Form {
  password: string;
  confirmPassword: string;
}

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [resetToken, setResetToken] = useState("");

  const step1Form = useForm<Step1Form>({
    defaultValues: { phoneNumber: "" },
  });

  const step2Form = useForm<Step2Form>({
    defaultValues: { otp: "" },
  });

  const step3Form = useForm<Step3Form>({
    defaultValues: { password: "", confirmPassword: "" },
  });

  const handleRequestOtp = async (data: Step1Form) => {
    setLoading(true);
    try {
      await publicAuthService.requestOtp(data.phoneNumber);
      setPhoneNumber(data.phoneNumber);
      toast.success("OTP has been sent to your phone (if it exists).");
      setStep(2);
    } catch (error: unknown) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Failed to request OTP.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (data: Step2Form) => {
    setLoading(true);
    try {
      const res = await publicAuthService.verifyOtp(phoneNumber, data.otp);
      setResetToken(res.resetToken);
      toast.success("OTP verified successfully.");
      setStep(3);
    } catch (error: unknown) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Failed to verify OTP.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (data: Step3Form) => {
  if (data.password !== data.confirmPassword) {
    toast.error("Passwords do not match.");
    return;
  }

  setLoading(true);
  try {
    await publicAuthService.resetPassword(
      phoneNumber,
      resetToken,
      data.password
    );

    toast.success("Password reset successfully. Redirecting...");

    // Auto redirect after success
    setTimeout(() => {
      window.location.href = "/";
    }, 1200);

  } catch (error: unknown) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Failed to reset password.";
    toast.error(message);
  } finally {
    setLoading(false);
  }
};


  const renderStepIndicator = () => {
    const steps: { id: Step; label: string }[] = [
      { id: 1, label: "Phone" },
      { id: 2, label: "OTP" },
      { id: 3, label: "New Password" },
    ];

    return (
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mb-4">
        {steps.map((s, index) => {
          const isActive = s.id === step;
          const isCompleted = s.id < step;
          return (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={[
                  "flex h-6 w-6 items-center justify-center rounded-full border text-[11px]",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : isCompleted
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-muted text-muted-foreground",
                ].join(" ")}
              >
                {s.id}
              </div>
              <span
                className={[
                  "hidden sm:inline-block",
                  isActive || isCompleted ? "font-medium" : "",
                ].join(" ")}
              >
                {s.label}
              </span>
              {index < steps.length - 1 && (
                <div className="hidden sm:block w-8 h-px bg-border" />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Forgot Password</CardTitle>
          <CardDescription>
            Reset your password in three simple steps.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {renderStepIndicator()}

          {step === 1 && (
            <form
              className="space-y-4"
              onSubmit={step1Form.handleSubmit(handleRequestOtp)}
            >
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  placeholder="Enter your phone number"
                  {...step1Form.register("phoneNumber", {
                    required: "Phone number is required",
                  })}
                />
                {step1Form.formState.errors.phoneNumber && (
                  <p className="text-xs text-red-500">
                    {step1Form.formState.errors.phoneNumber.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form
              className="space-y-4"
              onSubmit={step2Form.handleSubmit(handleVerifyOtp)}
            >
              <div className="space-y-2">
                <Label htmlFor="otp">OTP Code</Label>
                <Input
                  id="otp"
                  placeholder="Enter the OTP you received"
                  {...step2Form.register("otp", {
                    required: "OTP is required",
                    minLength: {
                      value: 4,
                      message: "OTP seems too short",
                    },
                  })}
                />
                {step2Form.formState.errors.otp && (
                  <p className="text-xs text-red-500">
                    {step2Form.formState.errors.otp.message}
                  </p>
                )}
              </div>

              <div className="flex justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form
              className="space-y-4"
              onSubmit={step3Form.handleSubmit(handleResetPassword)}
            >
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter new password"
                  {...step3Form.register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Minimum 6 characters",
                    },
                  })}
                />
                {step3Form.formState.errors.password && (
                  <p className="text-xs text-red-500">
                    {step3Form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter new password"
                  {...step3Form.register("confirmPassword", {
                    required: "Please confirm your password",
                    minLength: {
                      value: 6,
                      message: "Minimum 6 characters",
                    },
                  })}
                />
                {step3Form.formState.errors.confirmPassword && (
                  <p className="text-xs text-red-500">
                    {step3Form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="flex justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(2)}
                  disabled={loading}
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex justify-center text-xs text-muted-foreground gap-1">
          <span>Remember your password?</span>
          <Link href="/" className="text-primary hover:underline">
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
