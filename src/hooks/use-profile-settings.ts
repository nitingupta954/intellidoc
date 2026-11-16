"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export function useProfileSettings() {
  const { data: session, update } = useSession();

  const user = session?.user;
  const nameParts = user?.name ? user.name.trim().split(/\s+/) : [];
  const initialFirstName = nameParts[0] || "";
  const initialLastName = nameParts.slice(1).join(" ");
  const email = user?.email || "";

  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [isProfileSaving, setIsProfileSaving] = useState(false);

  const [profileImage, setProfileImage] = useState<string | null>(
    user?.image ?? null
  );
  const [isImageUploading, setIsImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session?.user?.name) {
      const parts = session.user.name.trim().split(/\s+/);
      setFirstName(parts[0] || "");
      setLastName(parts.slice(1).join(" ") || "");
    }
    if (session?.user?.image !== undefined) {
      setProfileImage(session.user.image);
    }
  }, [session?.user?.name, session?.user?.image]);

  const isProfileDirty =
    firstName.trim() !== initialFirstName.trim() ||
    lastName.trim() !== initialLastName.trim();

  const handleSaveProfile = async () => {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (!trimmedFirstName) {
      toast.error("First name is required");
      return;
    }

    if (`${trimmedFirstName} ${trimmedLastName}`.trim().length > 80) {
      toast.error("Name must be 80 characters or fewer");
      return;
    }

    setIsProfileSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${trimmedFirstName} ${trimmedLastName}`.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await update({ name: `${trimmedFirstName} ${trimmedLastName}`.trim() });
        toast.success("Profile updated");
      } else {
        toast.error(data.error || "Failed to update profile");
      }
    } catch (error: unknown) {
      toast.error(
        "Failed to update profile: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type)) {
      toast.error("Choose a PNG, JPG, WebP, or GIF image");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > 800 * 1024) {
      toast.error("Image must be smaller than 800 KB");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsImageUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          const res = await fetch("/api/user/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64String }),
          });
          const data = await res.json();
          if (res.ok && data.success) {
            setProfileImage(base64String);
            await update({ image: base64String });
            toast.success("Profile photo updated");
          } else {
            toast.error(data.error || "Failed to update profile photo");
          }
        } catch {
          toast.error("Failed to update profile photo");
        } finally {
          setIsImageUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };
      reader.onerror = () => {
        toast.error("Failed to read that image");
        setIsImageUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Failed to process image");
      setIsImageUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleImageRemove = async () => {
    if (!profileImage) return;
    setIsImageUploading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: null }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfileImage(null);
        await update({ image: null });
        toast.success("Profile photo removed");
      } else {
        toast.error(data.error || "Failed to remove profile photo");
      }
    } catch {
      toast.error("Failed to remove profile photo");
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleCancel = () => {
    setFirstName(initialFirstName);
    setLastName(initialLastName);
  };

  return {
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
    handleSaveProfile,
    handleImageUpload,
    handleImageRemove,
    handleCancel,
  };
}
