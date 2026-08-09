import { useRef, useState, useCallback } from "react";
import { Camera, X, Loader2, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ProfileUploaderProps {
  value?: string | null;          // current preview URL
  onChange: (result: { url: string; publicId: string } | null) => void;
  disabled?: boolean;
  className?: string;
}

const MAX_SIZE_MB  = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * Uploads directly to Cloudinary via signed upload.
 * The signature is fetched from your backend so CLOUDINARY_API_SECRET
 * never leaves the server.
 */
async function uploadToCloudinary(file: File): Promise<{
  url: string;
  publicId: string;
}> {
  // 1. Get signed params from backend
  const signRes = await fetch(
    `${import.meta.env.VITE_API_URL}/api/upload/sign`
  );
  if (!signRes.ok) throw new Error("Failed to get upload signature.");

  const { timestamp, signature, apiKey, cloudName, folder } =
    (await signRes.json()) as {
      timestamp:  number;
      signature:  string;
      apiKey:     string;
      cloudName:  string;
      folder:     string;
    };

  // 2. Upload directly to Cloudinary
  const form = new FormData();
  form.append("file",       file);
  form.append("api_key",    apiKey);
  form.append("timestamp",  String(timestamp));
  form.append("signature",  signature);
  form.append("folder",     folder);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: form }
  );

  if (!uploadRes.ok) throw new Error("Cloudinary upload failed.");

  const data = (await uploadRes.json()) as {
    secure_url: string;
    public_id:  string;
  };

  return { url: data.secure_url, publicId: data.public_id };
}

export function ProfileUploader({
  value,
  onChange,
  disabled,
  className,
}: ProfileUploaderProps) {
  const inputRef               = useRef<HTMLInputElement>(null);
  const [preview, setPreview]  = useState<string | null>(value ?? null);
  const [loading, setLoading]  = useState(false);
  const [error, setError]      = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      // Validate type
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Only JPEG, PNG, WebP or GIF images are allowed.");
        return;
      }

      // Validate size
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`Image must be smaller than ${MAX_SIZE_MB} MB.`);
        return;
      }

      // Show local preview immediately
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      try {
        setLoading(true);
        const result = await uploadToCloudinary(file);
        onChange(result);
      } catch (err) {
        setError("Upload failed. Please try again.");
        setPreview(null);
        onChange(null);
        console.error("ProfileUploader error:", err);
      } finally {
        setLoading(false);
      }
    },
    [onChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset so same file can be re-selected
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    onChange(null);
  };

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {/* ── Avatar area ── */}
      <div
        className={cn(
          "relative group cursor-pointer",
          disabled && "pointer-events-none opacity-60"
        )}
        onClick={() => !loading && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label="Upload profile picture"
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      >
        {/* Circle */}
        <div
          className={cn(
            "relative w-24 h-24 rounded-full overflow-hidden",
            "border-2 border-dashed border-border",
            "bg-muted flex items-center justify-center",
            "transition-all duration-200",
            "group-hover:border-primary group-hover:bg-primary/5",
            preview && "border-solid border-primary/40"
          )}
        >
          {preview ? (
            <img
              src={preview}
              alt="Profile preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <UserRound className="h-10 w-10 text-muted-foreground" />
          )}

          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {/* Hover overlay */}
          {!loading && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="h-6 w-6 text-white" />
            </div>
          )}
        </div>

        {/* Remove button */}
        {preview && !loading && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            className={cn(
              "absolute -top-1 -right-1 z-10",
              "w-5 h-5 rounded-full",
              "bg-destructive text-destructive-foreground",
              "flex items-center justify-center",
              "transition-opacity hover:opacity-90",
              "ring-2 ring-background"
            )}
            aria-label="Remove image"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        className="sr-only"
        onChange={handleInputChange}
        disabled={disabled || loading}
        aria-hidden="true"
      />

      {/* Caption */}
      <div className="text-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || loading}
          onClick={() => inputRef.current?.click()}
          className="text-xs"
        >
          {loading
            ? "Uploading…"
            : preview
            ? "Change Photo"
            : "Upload Photo"}
        </Button>
        <p className="text-xs text-muted-foreground mt-1">
          JPEG, PNG or WebP · Max {MAX_SIZE_MB} MB
        </p>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-destructive text-center max-w-[200px]">
          {error}
        </p>
      )}
    </div>
  );
}