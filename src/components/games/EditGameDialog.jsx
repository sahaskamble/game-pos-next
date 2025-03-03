import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { PB_URL } from "@/lib/constant/url";
import { useState, useEffect } from "react";

export function EditGameDialog({ open, onOpenChange, fields, onSubmit, initialData }) {
  const [formData, setFormData] = useState(initialData);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    setFormData(initialData);
    if (initialData?.game_avatar) {
      setImagePreview(`${PB_URL}/api/files/games/${initialData.id}/${initialData.game_avatar}?thumb=100x100`);
    }
  }, [initialData]);

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, [fieldName]: file });
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderField = (field) => {
    if (field.type === "file") {
      return (
        <div className="space-y-2">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, field.name)}
          />
          {imagePreview && (
            <div className="relative w-24 h-24">
              <Image
                src={imagePreview}
                alt="Preview"
                fill
                className="rounded-md object-cover"
              />
            </div>
          )}
        </div>
      );
    }

    return (
      <Input
        type={field.type === "number" ? "number" : "text"}
        value={formData[field.name] || ""}
        onChange={(e) =>
          setFormData({ ...formData, [field.name]: e.target.value })
        }
      />
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Game</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <Label htmlFor={field.name}>{field.label}</Label>
              {renderField(field)}
            </div>
          ))}
          <Button type="submit">Save changes</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}