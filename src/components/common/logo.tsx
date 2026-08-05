import { Link } from "@tanstack/react-router";
import logoImg from "@/assets/logo.png";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark";
  showText?: boolean;
}

export function Logo({
  className,
  size = "md",
  variant = "light",
  showText = true,
}: LogoProps) {
  const iconSizes = {
    sm: "h-7 w-auto",
    md: "h-9 w-auto",
    lg: "h-11 w-auto",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <Link to="/" className={cn("inline-flex items-center gap-2.5 group", className)}>
      <img
        src={logoImg}
        alt="Aperta Start"
        className={cn("object-contain transition-transform duration-200 group-hover:scale-105", iconSizes[size])}
      />
      {showText && (
        <span
          className={cn(
            "font-black tracking-tight leading-none uppercase font-display",
            textSizes[size],
            variant === "light" ? "text-white" : "text-foreground"
          )}
        >
          APERTA<span className="text-accent">START</span>
        </span>
      )}
    </Link>
  );
}
