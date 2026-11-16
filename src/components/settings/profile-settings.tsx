"use client";

import { Camera, Loader2, Lock, Trash2 } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ProfileSettingsProps {
  firstName: string;
  setFirstName: (val: string) => void;
  lastName: string;
  setLastName: (val: string) => void;
  email: string;
  profileImage: string | null;
  isImageUploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isProfileSaving: boolean;
  isProfileDirty: boolean;
  onSaveProfile: () => Promise<void>;
  onImageUpload: React.ChangeEventHandler<HTMLInputElement>;
  onImageRemove: () => Promise<void>;
  onCancel: () => void;
}

export function ProfileSettings({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  profileImage,
  isImageUploading,
  fileInputRef,
  isProfileSaving,
  isProfileDirty,
  onSaveProfile,
  onImageUpload,
  onImageRemove,
  onCancel,
}: ProfileSettingsProps) {
  const fullName = `${firstName} ${lastName}`.trim();
  const nameError = isProfileDirty && !firstName.trim();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Your photo, display name, and sign-in email.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImageUploading}
            className="group relative inline-flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:opacity-70"
            aria-label="Change profile photo"
          >
            <Avatar
              src={profileImage}
              name={fullName || "Your profile"}
              size="lg"
              className="size-20 text-lg"
              aria-hidden="true"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-foreground/55 text-background opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              {isImageUploading ? (
                <Loader2 className="size-5 animate-spin" aria-hidden="true" />
              ) : (
                <Camera className="size-5" aria-hidden="true" />
              )}
            </span>
          </button>

          <div className="min-w-0 space-y-2">
            <p className="text-sm font-medium text-foreground">
              {fullName || "Your profile"}
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, WebP, or GIF up to 800 KB.
            </p>
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={onImageUpload}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isImageUploading}
              >
                <Camera className="size-3.5" aria-hidden="true" />
                Change photo
              </Button>
              {profileImage ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive-soft hover:text-destructive"
                  onClick={() => void onImageRemove()}
                  disabled={isImageUploading}
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                  Remove
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="profile-first-name" className="text-sm font-medium">
              First name
            </label>
            <Input
              id="profile-first-name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              autoComplete="given-name"
              maxLength={40}
              aria-invalid={nameError || undefined}
              aria-describedby={nameError ? "profile-first-name-error" : undefined}
            />
            {nameError ? (
              <p
                id="profile-first-name-error"
                className="text-xs text-destructive"
                role="alert"
              >
                First name is required.
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label htmlFor="profile-last-name" className="text-sm font-medium">
              Last name
            </label>
            <Input
              id="profile-last-name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              autoComplete="family-name"
              maxLength={40}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="profile-email" className="text-sm font-medium">
              Email address
            </label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="profile-email"
                type="email"
                value={email}
                readOnly
                disabled
                className="pl-9"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Email changes are handled by support to keep account recovery
              secure.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={!isProfileDirty || isProfileSaving}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={() => void onSaveProfile()}
          loading={isProfileSaving}
          disabled={!isProfileDirty || !firstName.trim()}
        >
          Save changes
        </Button>
      </CardFooter>
    </Card>
  );
}
