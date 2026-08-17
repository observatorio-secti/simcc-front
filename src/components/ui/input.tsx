import * as React from 'react';
import { cn } from '../../lib';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    const localRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => localRef.current!);

    React.useEffect(() => {
      if (localRef.current) {
        localRef.current.style.setProperty('padding-left', '1rem');
        if (props.autoFocus) {
          localRef.current.focus();
        }
      }
    }, [props.autoFocus]);

    return (
      <input
        placeholder="Pesquisar"
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:placeholder:text-neutral-400',
          className,
        )}
        ref={localRef}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';

export { Input };
