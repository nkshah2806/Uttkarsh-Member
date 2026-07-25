import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import user from "../assets/user.png";
import { Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Config } from "@/lib/Config";
import { Button } from "./ui/button";

export function ImageUploader({
  label,
  multiple = false,
  onImageChange,
  defaultImage = "",
  handleUploadProfile,
  deleteDefaultImage,
}) {
  const MAX_FILES = 10;
  const MAX_FILE_SIZE_MB = 5;
  const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

  const [defaultPreviews, setDefaultPreviews] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const selectedFilesRef = useRef([]);
  const isServicesPath = window.location.pathname.includes("/services/");
  const [isDeleting, setIsDeleting] = useState(false); // Add a deleting state

  useEffect(() => {
    const normalized = Array.isArray(defaultImage) ? defaultImage : [defaultImage];
    setDefaultPreviews(normalized.filter(Boolean));
    setNewPreviews([]);
    selectedFilesRef.current = [];
  }, [defaultImage]);

  useEffect(() => {
    return () => {
      newPreviews.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  const validateFiles = (files) => {
    return files.filter((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name} is not a valid image.`);
        return false;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB.`);
        return false;
      }
      return true;
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = validateFiles(files);
    if (!validFiles.length) return;
    const totalFilesCount = selectedFilesRef.current.length + validFiles.length;

    if (multiple && totalFilesCount > MAX_FILES) {
      toast.error(`You can upload up to ${MAX_FILES} images only.`);
      return;
    }
    const previewURLs = validFiles.map((file) => URL.createObjectURL(file));

    if (multiple) {
      setNewPreviews((prev) => [...prev, ...previewURLs]);
      selectedFilesRef.current = [...selectedFilesRef.current, ...validFiles];
    } else {
      setDefaultPreviews([]);
      setNewPreviews([previewURLs[0]]);
      selectedFilesRef.current = [validFiles[0]];
    }

    onImageChange && onImageChange(selectedFilesRef.current);
    validFiles.forEach(handleUploadProfile);
    e.target.value = null; // reset input
  };

  const handleRemoveImage = async (index) => {
    // Check if delete is in progress
    if (isDeleting) return; // Prevent further deletes if already deleting

    setIsDeleting(true); // Set deleting to true
    try {
      if (index < defaultPreviews.length) {
        const updated = defaultPreviews.filter((_, i) => i !== index);
        setDefaultPreviews(updated);
        deleteDefaultImage && deleteDefaultImage(defaultPreviews[index]);
      } else {
        const newIndex = index - defaultPreviews.length;
        const updatedNew = newPreviews.filter((_, i) => i !== newIndex);
        selectedFilesRef.current = selectedFilesRef.current.filter((_, i) => i !== newIndex);
        setNewPreviews(updatedNew);
      }

      onImageChange && onImageChange(selectedFilesRef.current);
      
      // Simulate server request for deletion (this should be replaced with your API request)
      const serverResponse = await new Promise((resolve) =>
        setTimeout(() => resolve({ status: 200 }), 1000) // Simulate 1 second delay
      );

      if (serverResponse.status === 200) {
        toast.success("Image deleted successfully.");
      } else {
        toast.error("Failed to delete image.");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the image.");
    } finally {
      setIsDeleting(false); // Reset deleting state
    }
  };

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files || []);
      const validFiles = validateFiles(files);
      if (!validFiles.length) return;
      const totalFilesCount = selectedFilesRef.current.length + validFiles.length;
      if (multiple && totalFilesCount > MAX_FILES) {
        toast.error(`You can upload up to ${MAX_FILES} images only.`);
        return;
      }
      const previewURLs = validFiles.map((file) => URL.createObjectURL(file));

      if (multiple) {
        setNewPreviews((prev) => [...prev, ...previewURLs]);
        selectedFilesRef.current = [...selectedFilesRef.current, ...validFiles];
      } else {
        setDefaultPreviews([]);
        setNewPreviews([previewURLs[0]]);
        selectedFilesRef.current = [validFiles[0]];
      }

      onImageChange && onImageChange(selectedFilesRef.current);
      validFiles.forEach(handleUploadProfile);
    },
    [multiple]
  );

  return (
    <div>
      <Label className="mb-3">{label}</Label>
      <div className="flex items-center gap-9">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="flex-none border-2 border-dashed border-gray-400 p-4 rounded-lg cursor-pointer flex items-center justify-center"
        >
          <label
            htmlFor="upload"
            className="flex items-center justify-center flex-col"
          >
            <UploadCloud size={45} />
            <p className="text-sm text-gray-500 mt-2 text-center">
              Drag & drop or click to upload
            </p>
            <Input
              className="hidden"
              id="upload"
              type="file"
              accept="image/jpeg, image/jpg, image/png"
              multiple={multiple}
              onChange={handleFileChange}
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-3">
          {[...defaultPreviews, ...newPreviews]?.map((src, index) => (
            <div
              key={index}
              className={`relative w-27 h-27 object-cover ${isServicesPath ? "rounded-md" : "rounded-full"}`}
            >
              <img
                src={src.startsWith("blob:") ? src : `${Config.API_URL}${src}`}
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null;
                  currentTarget.src = user;
                }}
                alt={`Preview ${index}`}
                className={`w-full h-full object-cover ${isServicesPath ? "rounded-md" : "rounded-full"}`}
              />
              {multiple && (
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-1 right-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage(index);
                  }}
                  type="button"
                  disabled={isDeleting} // Disable button while deleting
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-t-2 border-gray-300 border-t-gray-500 rounded-full animate-spin"></div>
                  ) : (
                    <Trash2 className="text-red-600" /> // Change trash color here
                  )}
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
