import React from "react";
import "./Button.scss";

interface ButtonProps {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: string;
  disabled?: boolean;
}

function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
}: ButtonProps) {
  return (
    <button
      className={`button button--${variant}`}
      onClick={(e) => onClick(e)}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;