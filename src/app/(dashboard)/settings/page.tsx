"use client";

import { useState } from "react";
import { Bell, Key, Shield, User } from "lucide-react";

import { ApiSettings } from "@/components/settings/api-settings";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { SecuritySettings } from "@/components/settings/security-settings";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { useApiKeys } from "@/hooks/use-api-keys";
import { useNotificationSettings } from "@/hooks/use-notification-settings";
import { useProfileSettings } from "@/hooks/use-profile-settings";
import { useSecuritySettings } from "@/hooks/use-security-settings";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security & access", icon: Shield },
  { id: "api", label: "API keys", icon: Key },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  const profile = useProfileSettings();
  const notificationPrefs = useNotificationSettings();
  const security = useSecuritySettings();
  const apiKeys = useApiKeys();

  return (
    <PageContainer className="space-y-6 pb-8">
      <PageHeader
        title="Settings"
        description="Manage your profile, notifications, password, and model keys."
      />

      <div className="flex min-w-0 flex-col gap-6 md:flex-row md:gap-8">
        <nav
          aria-label="Settings sections"
          className="min-w-0 shrink-0 md:w-56"
        >
          <div
            role="tablist"
            aria-label="Settings sections"
            className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1 scrollbar-thin md:flex-col md:overflow-visible md:p-2"
          >
            {TABS.map((tab, index) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`settings-tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls="settings-panel"
                  tabIndex={active ? 0 : -1}
                  onClick={() => setActiveTab(tab.id)}
                  onKeyDown={(event) => {
                    const direction =
                      event.key === "ArrowDown" || event.key === "ArrowRight"
                        ? 1
                        : event.key === "ArrowUp" || event.key === "ArrowLeft"
                          ? -1
                          : 0;
                    if (!direction) return;
                    event.preventDefault();
                    const nextIndex =
                      (index + direction + TABS.length) % TABS.length;
                    const nextTab = TABS[nextIndex];
                    setActiveTab(nextTab.id);
                    document
                      .getElementById(`settings-tab-${nextTab.id}`)
                      ?.focus();
                  }}
                  className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring md:w-full ${
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>

        <div
          id="settings-panel"
          role="tabpanel"
          aria-labelledby={`settings-tab-${activeTab}`}
          className="min-w-0 flex-1 md:max-w-3xl"
        >
          {activeTab === "profile" ? (
            <ProfileSettings
              firstName={profile.firstName}
              setFirstName={profile.setFirstName}
              lastName={profile.lastName}
              setLastName={profile.setLastName}
              email={profile.email}
              profileImage={profile.profileImage}
              isImageUploading={profile.isImageUploading}
              fileInputRef={profile.fileInputRef}
              isProfileSaving={profile.isProfileSaving}
              isProfileDirty={profile.isProfileDirty}
              onSaveProfile={profile.handleSaveProfile}
              onImageUpload={profile.handleImageUpload}
              onImageRemove={profile.handleImageRemove}
              onCancel={profile.handleCancel}
            />
          ) : null}

          {activeTab === "notifications" ? (
            <NotificationSettings
              notifications={notificationPrefs.notifications}
              setNotifications={notificationPrefs.setNotifications}
              isNotificationsSaving={notificationPrefs.isNotificationsSaving}
              isNotificationsDirty={notificationPrefs.isNotificationsDirty}
              onSaveNotifications={notificationPrefs.handleSaveNotifications}
              onResetDefaults={notificationPrefs.handleResetDefaults}
              onCancel={notificationPrefs.handleCancel}
            />
          ) : null}

          {activeTab === "security" ? (
            <SecuritySettings
              currentPassword={security.currentPassword}
              setCurrentPassword={security.setCurrentPassword}
              newPassword={security.newPassword}
              setNewPassword={security.setNewPassword}
              confirmPassword={security.confirmPassword}
              setConfirmPassword={security.setConfirmPassword}
              isPasswordSaving={security.isPasswordSaving}
              isPasswordDirty={security.isPasswordDirty}
              onUpdatePassword={security.handleUpdatePassword}
              onCancel={security.handleCancel}
            />
          ) : null}

          {activeTab === "api" ? (
            <ApiSettings
              openApiKey={apiKeys.openApiKey}
              setOpenApiKey={apiKeys.setOpenApiKey}
              maskedOpenApiKey={apiKeys.maskedOpenApiKey}
              isOpenAiKeySaving={apiKeys.isOpenAiKeySaving}
              onSaveOpenApiKey={apiKeys.handleSaveOpenApiKey}
              onRevokeOpenApiKey={apiKeys.handleRevokeOpenApiKey}
              geminiKey={apiKeys.geminiKey}
              setGeminiKey={apiKeys.setGeminiKey}
              maskedGeminiKey={apiKeys.maskedGeminiKey}
              isSystemGeminiKey={apiKeys.isSystemGeminiKey}
              isGeminiKeySaving={apiKeys.isGeminiKeySaving}
              onSaveGeminiKey={apiKeys.handleSaveGeminiKey}
              onRevokeGeminiKey={apiKeys.handleRevokeGeminiKey}
              isKeyLoading={apiKeys.isKeyLoading}
            />
          ) : null}
        </div>
      </div>
    </PageContainer>
  );
}
