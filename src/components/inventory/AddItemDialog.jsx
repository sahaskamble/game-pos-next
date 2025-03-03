import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export function AddItemDialog({ open, onOpenChange, fields, onSubmit, type = "item" }) {
  const [formData, setFormData] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
    setFormData({});
    onOpenChange(false);
  };

  const renderField = (field) => {
    switch (field.type) {
      case "select":
        return (
          <Select
            value={formData[field.name]?.toString()}
            onValueChange={(value) =>
              setFormData({ ...formData, [field.name]: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((option) => (
                <SelectItem 
                  key={typeof option === 'object' ? option.value : option} 
                  value={typeof option === 'object' ? option.value : option}
                >
                  {typeof option === 'object' ? option.label : option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case "relation":
        return (
          <Select
            value={formData[field.name]?.toString()}
            onValueChange={(value) =>
              setFormData({ ...formData, [field.name]: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "number":
        return (
          <Input
            type="number"
            value={formData[field.name] || ""}
            onChange={(e) =>
              setFormData({ ...formData, [field.name]: e.target.value })
            }
          />
        );

      default:
        return (
          <Input
            value={formData[field.name] || ""}
            onChange={(e) =>
              setFormData({ ...formData, [field.name]: e.target.value })
            }
          />
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New {type}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <Label htmlFor={field.name}>{field.label}</Label>
              {renderField(field)}
            </div>
          ))}
          <Button type="submit">Add {type}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
