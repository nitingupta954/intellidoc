"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface NotificationPreferences {
  emailDigest: boolean;
  documentProcessing: boolean;
  securityAlerts: boolean;
  newFeatures: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  emailDigest: true,
  documentProcessing: true,
  securityAlerts: true,
  newFeatures: false,
};

function preferencesMatch(
  left: NotificationPreferences,
  right: NotificationPreferences
) {
  return (
    left.emailDigest === right.emailDigest &&
    left.documentProcessing === right.documentProcessing &&
    left.securityAlerts === right.securityAlerts &&
    left.newFeatures === right.newFeatures
  );
}

export function useNotificationSettings() {
  const [notifications, setNotifications] =
    useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [savedNotifications, setSavedNotifications] =
    useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [isNotificationsSaving, setIsNotificationsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/user/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.preferences) {
          const preferences = {
            ...DEFAULT_PREFERENCES,
            ...data.preferences,
          } as NotificationPreferences;
          setNotifications(preferences);
          setSavedNotifications(preferences);
        }
      })
      .catch((error) =>
        console.error("Failed to fetch notification preferences", error)
      );
  }, []);

  const isNotificationsDirty = !preferencesMatch(
    notifications,
    savedNotifications
  );

  const handleSaveNotifications = async () => {
    setIsNotificationsSaving(true);
    try {
      const res = await fetch("/api/user/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: notifications }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedNotifications({ ...notifications });
        toast.success("Notification preferences saved");
      } else {
        toast.error(data.error || "Failed to save preferences");
      }
    } catch (error: unknown) {
      toast.error(
        "Failed to save preferences: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setIsNotificationsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setNotifications(DEFAULT_PREFERENCES);
  };

  const handleCancel = () => {
    setNotifications({ ...savedNotifications });
  };

  return {
    notifications,
    setNotifications,
    isNotificationsSaving,
    isNotificationsDirty,
    handleSaveNotifications,
    handleResetDefaults,
    handleCancel,
  };
}
