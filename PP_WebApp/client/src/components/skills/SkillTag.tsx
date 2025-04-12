import React from "react";
import { cn } from "@/lib/utils";

type VariantType = "primary" | "secondary" | "neutral";

interface SkillTagProps {
  name: string;
  variant?: VariantType;
  className?: string;
}

const SkillTag: React.FC<SkillTagProps> = ({ name, variant = "primary", className }) => {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  
  const variantClasses = {
    primary: "bg-primary-light text-primary",
    secondary: "bg-secondary-light text-secondary",
    neutral: "bg-neutral-100 text-neutral-800"
  };
  
  return (
    <span className={cn(baseClasses, variantClasses[variant], className)}>
      {name}
    </span>
  );
};

export default SkillTag;
