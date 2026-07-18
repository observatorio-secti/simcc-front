'use client';

import { forwardRef, useMemo, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { cn } from "../../lib"

import type { ButtonProps } from './button';
import { Button } from './button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover';
import { Input } from './input';
import { useForwardedRef } from '../../lib/use-forwarded-ref';

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

const ColorPicker = forwardRef<
  HTMLInputElement,
  Omit<ButtonProps, 'value' | 'onChange' | 'onBlur'> & ColorPickerProps
>(
  (
    { disabled, value, onChange, onBlur, name, className, ...props },
    forwardedRef
  ) => {
    const ref = useForwardedRef(forwardedRef);
    const [open, setOpen] = useState(false);

    const parsedValue = useMemo(() => {
      return value || '#FFFFFF';
    }, [value]);

    return (
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild disabled={disabled} onBlur={onBlur}>
          <Button
            {...props}
            className={cn('block min-w-10', className)}
            name={name}
            onClick={() => {
              setOpen(true);
            }}
            size='icon'
            style={{
              backgroundColor: parsedValue,
            }}
            variant='outline'
          >
            <div />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-full  flex flex-col gap-3'>
          <HexColorPicker color={parsedValue} onChange={onChange} />
          
          <Input
            maxLength={7}
            onChange={(e) => {
              onChange(e?.currentTarget?.value);
            }}
            ref={ref}
            value={parsedValue}
          
          />
        </PopoverContent>
      </Popover>
    );
  }
);
ColorPicker.displayName = 'ColorPicker';

export { ColorPicker };