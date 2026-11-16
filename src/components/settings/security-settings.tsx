"use client";

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

interface SecuritySettingsProps {
  currentPassword: string;
  setCurrentPassword: (val: string) => void;
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  isPasswordSaving: boolean;
  isPasswordDirty: boolean;
  onUpdatePassword: () => Promise<void>;
  onCancel: () => void;
}

export function SecuritySettings({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  isPasswordSaving,
  isPasswordDirty,
  onUpdatePassword,
  onCancel,
}: SecuritySettingsProps) {
  const passwordTooShort = newPassword.length > 0 && newPassword.length < 8;
  const passwordsMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;
  const canSubmit =
    Boolean(currentPassword) &&
    newPassword.length >= 8 &&
    newPassword === confirmPassword &&
    !isPasswordSaving;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>
          Use a unique password of at least 8 characters.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid max-w-md gap-4">
          <div className="space-y-2">
            <label htmlFor="current-password" className="text-sm font-medium">
              Current password
            </label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="new-password" className="text-sm font-medium">
              New password
            </label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              aria-invalid={passwordTooShort || undefined}
              aria-describedby={
                passwordTooShort ? "new-password-error" : "new-password-hint"
              }
            />
            {passwordTooShort ? (
              <p
                id="new-password-error"
                className="text-xs text-destructive"
                role="alert"
              >
                Use at least 8 characters.
              </p>
            ) : (
              <p id="new-password-hint" className="text-xs text-muted-foreground">
                At least 8 characters.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="confirm-password" className="text-sm font-medium">
              Confirm new password
            </label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              aria-invalid={passwordsMismatch || undefined}
              aria-describedby={
                passwordsMismatch ? "confirm-password-error" : undefined
              }
            />
            {passwordsMismatch ? (
              <p
                id="confirm-password-error"
                className="text-xs text-destructive"
                role="alert"
              >
                Passwords do not match.
              </p>
            ) : null}
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={!isPasswordDirty || isPasswordSaving}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={() => void onUpdatePassword()}
          loading={isPasswordSaving}
          disabled={!canSubmit}
        >
          Update password
        </Button>
      </CardFooter>
    </Card>
  );
}
