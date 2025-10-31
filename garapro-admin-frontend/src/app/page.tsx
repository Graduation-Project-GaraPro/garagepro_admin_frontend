/* eslint-disable @typescript-eslint/no-explicit-any */
// app/login/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Loader2, Eye, EyeOff, Phone, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

interface LoginFormData {
  phoneNumber: string;
  password: string;
}

export default function LoginPage() {
  const [loginForm, setLoginForm] = useState<LoginFormData>({
    phoneNumber: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("phone");

  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/admin";
  const sessionExpired = searchParams.get("session") === "expired";

  // ✅ Redirect nếu đã đăng nhập
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push(redirect);
    }
  }, [isAuthenticated, authLoading, router, redirect]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!loginForm.phoneNumber.trim()) {
      newErrors.phoneNumber = "Please enter your phone number";
    } else if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(loginForm.phoneNumber)) {
      newErrors.phoneNumber = "Invalid phone number format";
    }

    if (!loginForm.password) {
      newErrors.password = "Please enter your password";
    } else if (loginForm.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const result = await login({
        phoneNumber: loginForm.phoneNumber,
        password: loginForm.password,
      });

      console.log("✅ Phone login success:", result);

      //localStorage.setItem("authtoken", result.token);
      // Redirect sẽ được xử lý tự động trong useEffect
      router.push("/admin");
    } catch (err: any) {
      console.error("❌ Phone login failed:", err);

      let errorMessage = "Đăng nhập thất bại";

      // Xử lý lỗi cụ thể
      if (err.message?.includes("User not found")) {
        errorMessage = "Số điện thoại không tồn tại";
      } else if (err.message?.includes("Invalid login attempt")) {
        errorMessage = "Sai mật khẩu";
      } else if (err.message?.includes("Account is temporarily locked")) {
        errorMessage = "Tài khoản tạm thời bị khóa do đăng nhập sai nhiều lần";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setLoginForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    if (errors.general) setErrors((prev) => ({ ...prev, general: "" }));
  };

  // ✅ Loading khi đang check auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // ✅ Đã đăng nhập thì redirect
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            OtoGarage Login
          </CardTitle>
          <CardDescription className="text-gray-600">
            Welcome back! Please sign in to continue
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {sessionExpired && (
            <div className="p-3 border border-yellow-200 bg-yellow-50 rounded-md">
              <p className="text-sm text-yellow-700 text-center">
                Your session has expired. Please login again.
              </p>
            </div>
          )}

          {errors.general && (
            <div className="p-3 border border-red-200 bg-red-50 rounded-md">
              <p className="text-sm text-red-700 text-center">
                {errors.general}
              </p>
            </div>
          )}

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="phone">Phone Number</TabsTrigger>
            </TabsList>

            <TabsContent value="phone" className="space-y-4">
              <form onSubmit={handlePhoneLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="Enter your phone number"
                      className="pl-10"
                      value={loginForm.phoneNumber}
                      onChange={(e) =>
                        handleInputChange("phoneNumber", e.target.value)
                      }
                      disabled={isLoading}
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="text-sm text-red-600">{errors.phoneNumber}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="pl-10 pr-10"
                      value={loginForm.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <Link href="/forgot-password">
                    <Button
                      variant="link"
                      className="p-0 text-blue-600 hover:text-blue-800 text-sm"
                      type="button"
                    >
                      Forgot password?
                    </Button>
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <Separator />

          {/* <div className="text-center space-y-3">
            <div className="text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link href="/register">
                <Button
                  variant="link"
                  className="p-0 text-blue-600 hover:text-blue-800 font-medium"
                  type="button"
                >
                  Register now
                </Button>
              </Link>
            </div>

            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-800"
                type="button"
              >
                ← Back to homepage
              </Button>
            </Link>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
