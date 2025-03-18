import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { IndianRupeeIcon } from 'lucide-react'
import React from 'react'

export const PriceInput = ({ value = 0, onChange = () => { }, label }) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium">{label}</Label>
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">
        <IndianRupeeIcon className='text-muted-foreground size-4' />
      </span>
      <Input
        type="number"
        value={value}
        onChange={onChange}
      />
    </div>
  </div>
);
