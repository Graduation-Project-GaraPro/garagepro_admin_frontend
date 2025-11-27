"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  userService,
  UserDto,
  UpdateUserDto,
} from "@/services/profile-service";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface FormValues {
  gender: "male" | "female" | "";
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      gender: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
    },
  });

  // Load user info
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user: UserDto = await userService.getCurrentUser();
        reset({
          gender:
            user.gender === true ? "male" :
            user.gender === false ? "female" : "",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          dateOfBirth: user.dateOfBirth
            ? user.dateOfBirth.substring(0, 10)
            : "",
        });
      } catch (error: unknown) {
        console.error(error);
        toast.error("Failed to load user information");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [reset]);

  const onSubmit = async (data: FormValues) => {
    setSaving(true);

    const payload: UpdateUserDto = {
      gender:
        data.gender === "" ? null :
        data.gender === "male" ? true : false,
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      dateOfBirth: data.dateOfBirth || null,
    };

    try {
      const updated = await userService.updateCurrentUser(payload);
      toast.success("Profile updated successfully");

      reset({
        gender:
          updated.gender === true ? "male" :
          updated.gender === false ? "female" : "",
        firstName: updated.firstName || "",
        lastName: updated.lastName || "",
        dateOfBirth: updated.dateOfBirth
          ? updated.dateOfBirth.substring(0, 10)
          : "",
      });
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Update failed";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <Card className="shadow-md border">
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>
            Update your personal details below.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Name fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  {...register("firstName", {
                    maxLength: { value: 100, message: "Max 100 characters" },
                  })}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="text-xs text-red-500">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  {...register("lastName", {
                    maxLength: { value: 100, message: "Max 100 characters" },
                  })}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="text-xs text-red-500">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label>Gender</Label>
              <div className="flex items-center gap-6 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" {...register("gender")} value="male" />
                  <span>Male</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" {...register("gender")} value="female" />
                  <span>Female</span>
                </label>

              </div>
            </div>

            {/* DOB */}
            <div className="space-y-1">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                {...register("dateOfBirth")}
              />
            </div>

            <CardFooter className="px-0 pt-4 flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
