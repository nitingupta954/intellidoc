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
import { Switch } from "@/components/ui/switch";
import type { NotificationPreferences } from "@/hooks/use-notification-settings";

interface NotificationSettingsProps {
  notifications: NotificationPreferences;
  setNotifications: React.Dispatch<
    React.SetStateAction<NotificationPreferences>
  >;
  isNotificationsSaving: boolean;
  isNotificationsDirty: boolean;
  onSaveNotifications: () => Promise<void>;
  onResetDefaults: () => void;
  onCancel: () => void;
}

const ITEMS: Array<{
  key: keyof NotificationPreferences;
  title: string;
  description: string;
}> = [
  {
    key: "emailDigest",
    title: "Email digest",
    description: "Receive a weekly summary of workspace activity.",
  },
  {
    key: "documentProcessing",
    title: "Document processing",
    description: "Get notified when a large document finishes indexing.",
  },
  {
    key: "securityAlerts",
    title: "Security alerts",
    description: "Critical notifications about your account security.",
  },
  {
    key: "newFeatures",
    title: "New features",
    description: "Occasional updates about new platform capabilities.",
  },
];

export function NotificationSettings({
  notifications,
  setNotifications,
  isNotificationsSaving,
  isNotificationsDirty,
  onSaveNotifications,
  onResetDefaults,
  onCancel,
}: NotificationSettingsProps) {
  return (
    <Card className="pt-3">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Choose which account and workspace updates reach you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border">
          {ITEMS.map((item) => {
            const switchId = `notification-${item.key}`;
            return (
              <div
                key={item.key}
                className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <label
                    id={`${switchId}-label`}
                    htmlFor={switchId}
                    className="text-sm font-medium text-foreground"
                  >
                    {item.title}
                  </label>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <Switch
                  id={switchId}
                  checked={notifications[item.key]}
                  onCheckedChange={(checked) =>
                    setNotifications((previous) => ({
                      ...previous,
                      [item.key]: checked,
                    }))
                  }
                  disabled={isNotificationsSaving}
                  aria-labelledby={`${switchId}-label`}
                />
              </div>
            );
          })}
        </div>
      </CardContent>
      <CardFooter className="flex-wrap justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onResetDefaults}
          disabled={isNotificationsSaving}
        >
          Reset defaults
        </Button>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={!isNotificationsDirty || isNotificationsSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void onSaveNotifications()}
            loading={isNotificationsSaving}
            disabled={!isNotificationsDirty}
          >
            Save preferences
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
