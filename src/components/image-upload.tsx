import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Image as ImageIcon, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  value: string;
  onChange: (val: string) => void;
  lang: string;
  bucket?: string;
  pathPrefix?: string;
  className?: string;
  maxSizeMB?: number;
}

export function ImageUpload({
  value,
  onChange,
  lang,
  bucket = "attachments",
  pathPrefix = "covers",
  className = "h-36 w-full",
  maxSizeMB = 5,
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!value) {
      setPreviewUrl("");
      return;
    }
    if (value.startsWith("http://") || value.startsWith("https://")) {
      setPreviewUrl(value);
      return;
    }
    let active = true;
    supabase.storage
      .from(bucket)
      .createSignedUrl(value, 3600)
      .then(({ data, error }) => {
        if (active && data?.signedUrl) {
          setPreviewUrl(data.signedUrl);
        }
      });
    return () => {
      active = false;
    };
  }, [value, bucket]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) {
      toast.error(
        lang === "ar"
          ? "صيغة الملف غير مدعومة. يرجى اختيار صورة (JPG, PNG, WebP, GIF)."
          : "Unsupported file format. Please choose an image (JPG, PNG, WebP, GIF)."
      );
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(
        lang === "ar"
          ? `حجم الصورة كبير جداً. الحد الأقصى ${maxSizeMB} ميجابايت.`
          : `Image size is too large. Maximum size is ${maxSizeMB}MB.`
      );
      return;
    }

    setUploading(true);
    try {
      const storageName = `${crypto.randomUUID()}.${ext}`;
      const path = `${pathPrefix}/${storageName}`;
      const { error: upErr } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          contentType: file.type || `image/${ext === "jpg" ? "jpeg" : ext}`,
          cacheControl: "3600",
          upsert: true,
        });

      if (upErr) throw upErr;

      onChange(path);
      toast.success(
        lang === "ar" ? "تم رفع الصورة بنجاح" : "Image uploaded successfully"
      );
    } catch (err: any) {
      toast.error(
        err.message ||
        (lang === "ar" ? "فشل في رفع الصورة" : "Failed to upload image")
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setPreviewUrl("");
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={uploading}
      />

      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all duration-200 ${
          previewUrl
            ? "border-muted bg-muted/20"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/5"
        } ${uploading ? "pointer-events-none opacity-60" : ""} ${className}`}
      >
        {uploading ? (
          <div className="flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">
              {lang === "ar" ? "جاري الرفع..." : "Uploading..."}
            </span>
          </div>
        ) : previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Preview"
              className="h-full w-full rounded-md object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-md bg-black/40 opacity-0 transition-opacity duration-200 hover:opacity-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-8 gap-1 text-xs"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-3.5 w-3.5" />
                {lang === "ar" ? "تغيير" : "Change"}
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="h-8 gap-1 text-xs"
                onClick={handleRemove}
              >
                <Trash2 className="h-3.5 w-3.5" />
                {lang === "ar" ? "حذف" : "Remove"}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground/60" />
            <span className="text-sm font-medium text-muted-foreground">
              {lang === "ar" ? "انقر لرفع صورة" : "Click to upload image"}
            </span>
            <span className="mt-1 text-xs text-muted-foreground/60">
              {lang === "ar"
                ? `JPG, PNG, WebP (الحد الأقصى ${maxSizeMB}MB)`
                : `JPG, PNG, WebP (Max ${maxSizeMB}MB)`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
