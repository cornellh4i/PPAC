import React from "react";
import "./Icon.scss";

interface IconProps {
  children: React.ReactNode;
  variant?: string;
}

function Icon({ children, variant = "primary" }: IconProps) {
  return <span className={`icon icon--${variant}`}>{children}</span>;
}

export default Icon;
