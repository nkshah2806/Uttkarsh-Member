import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Camera, Loader2, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Config } from "@/lib/Config";
import { memberProfileService } from "@/services/memberProfileService";
import user from "@/assets/user.png";

/**
 * Member profile picture uploader.
 *
 * Uploads from the local device only (no URL input), validates type/size,
 * shows an in-place preview, supports replace and remove, and falls back to a
 * default avatar when no picture exists. The component owns its own loading /
 * error state so a failed upload can never leave the UI stuck.
 */
const MAX_FILE_SIZE_MB = 5;
// Must stay in sync with MEDIA_TYPES.image in Uttkarsh-Backend/middleware/multer.js
// (image/jpeg, image/png, image/webp) — otherwise the client would allow a file
// the server rejects with 415.
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function ProfilePictureUploader({
    value = "",
    onChange,
    name = "",
    disabled = false,
}) {
    const { t } = useTranslation();
    const inputRef = useRef(null);
    const localPreviewRef = useRef("");
    // Guards against duplicate/concurrent uploads. State updates are async, so a
    // rapid double-selection could otherwise fire two requests before the
    // "uploading" state re-renders and disables the button.
    const uploadingRef = useRef(false);
    const [preview, setPreview] = useState(value || "");
    const [uploading, setUploading] = useState(false);

    // Keep the preview in sync when the parent loads a fresh profile.
    useEffect(() => {
        setPreview(value || "");
    }, [value]);

    // Revoke any blob URL we created to avoid leaking memory.
    useEffect(() => {
        return () => {
            if (localPreviewRef.current) URL.revokeObjectURL(localPreviewRef.current);
        };
    }, []);

    const resolveSrc = (src) => {
        if (!src) return user;
        if (src.startsWith("blob:") || src.startsWith("http")) return src;
        return `${Config.API_URL}${src}`;
    };

    const persistReference = async (reference, successMessage) => {
        // Mirror the reference onto MemberProfile so the admin review screens
        // (which read the profile document) always show the same picture.
        // A failure here must not break the upload, which already succeeded on
        // the User record, so it is non-fatal when the endpoint is unavailable.
        try {
            await memberProfileService.saveProfilePicture(reference);
        } catch (err) {
            console.warn("Could not sync profile picture to member profile:", err?.message || err);
        }
        onChange && onChange(reference);
        toast.success(successMessage);
    };

    const handleFile = async (file) => {
        if (!file) return;
        if (uploadingRef.current) return; // already uploading — ignore duplicates

        if (!ALLOWED_TYPES.includes(file.type)) {
            toast.error(t("demo.memberProfile.pictureInvalidType"));
            return;
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
            toast.error(t("demo.memberProfile.pictureTooLarge"));
            return;
        }

        // Instant local preview while the network request is in flight.
        if (localPreviewRef.current) URL.revokeObjectURL(localPreviewRef.current);
        const blobUrl = URL.createObjectURL(file);
        localPreviewRef.current = blobUrl;
        setPreview(blobUrl);

        uploadingRef.current = true;
        setUploading(true);
        try {
            const res = await memberProfileService.uploadProfilePicture(file);
            const uploaded = res?.data?.image || res?.user?.image || "";
            if (!uploaded) {
                throw new Error(res?.message || t("demo.memberProfile.pictureUploadFailed"));
            }
            await persistReference(uploaded, t("demo.memberProfile.pictureUploaded"));
            setPreview(uploaded);
        } catch (err) {
            // Roll the preview back to the last known good value.
            setPreview(value || "");
            toast.error(
                err?.response?.data?.message ||
                err?.message ||
                t("demo.memberProfile.pictureUploadFailed")
            );
        } finally {
            // ALWAYS clear both flags, so a failed/aborted request can never
            // leave the loader stuck.
            uploadingRef.current = false;
            setUploading(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    const handleInputChange = (e) => {
        handleFile(e.target.files?.[0]);
    };

    const handleRemove = async () => {
        if (uploadingRef.current) return;
        uploadingRef.current = true;
        setUploading(true);
        try {
            await persistReference("", t("demo.memberProfile.pictureRemoved"));
            if (localPreviewRef.current) {
                URL.revokeObjectURL(localPreviewRef.current);
                localPreviewRef.current = "";
            }
            setPreview("");
        } catch (err) {
            toast.error(
                err?.response?.data?.message ||
                err?.message ||
                t("demo.memberProfile.pictureRemoveFailed")
            );
        } finally {
            uploadingRef.current = false;
            setUploading(false);
        }
    };

    return (
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-xs">
            <div className="flex items-center gap-3 border-b border-border pb-4">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600">
                    <Camera className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-lg font-bold">{t("demo.memberProfile.profilePicture")}</h2>
                    <p className="text-xs text-muted-foreground">
                        {t("demo.memberProfile.profilePictureDesc")}
                    </p>
                </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-28 h-28 flex-none">
                    <img
                        src={resolveSrc(preview)}
                        alt={name || t("demo.memberProfile.profilePicture")}
                        onError={({ currentTarget }) => {
                            currentTarget.onerror = null;
                            currentTarget.src = user;
                        }}
                        className="w-full h-full rounded-full object-cover border border-border bg-muted"
                    />
                    {uploading && (
                        <div className="absolute inset-0 rounded-full bg-background/70 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    )}
                </div>

                <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            disabled={disabled || uploading}
                            onClick={() => inputRef.current?.click()}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {t("demo.memberProfile.saving")}
                                </>
                            ) : (
                                <>
                                    <UploadCloud className="w-4 h-4" />
                                    {preview
                                        ? t("demo.memberProfile.changePhoto")
                                        : t("demo.memberProfile.uploadPhoto")}
                                </>
                            )}
                        </button>

                        {preview && !uploading && (
                            <button
                                type="button"
                                disabled={disabled}
                                onClick={handleRemove}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-destructive hover:border-destructive/40 disabled:opacity-50 transition cursor-pointer"
                            >
                                <Trash2 className="w-4 h-4" />
                                {t("demo.memberProfile.removePhoto")}
                            </button>
                        )}
                    </div>

                    <p className="text-xs text-muted-foreground">{t("demo.memberProfile.pictureHint")}</p>
                </div>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={handleInputChange}
            />
        </div>
    );
}
