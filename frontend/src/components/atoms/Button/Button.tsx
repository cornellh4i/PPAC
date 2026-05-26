import React from "react";
import "./Button.scss";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: string;
  disabled?: boolean;
  className?: string;
}

function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  className = "",
}: ButtonProps) {
  return (
    <button
      className={`button button--${variant} ${className}`.trim()}
      onClick={(e) => onClick?.(e)}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;
