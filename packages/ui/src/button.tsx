"use client";

import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  className?: string;
  appName: string;
  onHandleClick : () => void;
}

export const Button = ({ children, className, appName, onHandleClick }: ButtonProps) => {
  return (
    <button
      className={className}
      onClick={onHandleClick}
    >
      {children}
    </button>
  );
};
