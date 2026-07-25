import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "tracking-wide inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-sm min-w-[100px] whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        completed:
          "border-transparent bg-[#008236]/20 text-[#008236] [a&]:hover:bg-primary/90 dark:bg-[#05df72]/20 dark:text-[#05df72]",
        confirmed:
          "border-transparent bg-[#FF9305]/20 text-[#894b00] [a&]:hover:bg-primary/90 dark:bg-[#ffb84d]/20 dark:text-[#ffb84d]",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-[#c10007]/20 text-[#c10007] [a&]:hover:bg-destructive/90 dark:bg-[#ff6467]/20 dark:text-[#ff6467]",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
