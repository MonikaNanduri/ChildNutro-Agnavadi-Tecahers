import { cn } from "../../lib/utils";
import { motion } from "motion/react";
import React, { ReactNode } from "react";

export const Card = ({ children, className, delay = 0, style }: { children: ReactNode; className?: string; delay?: number; style?: React.CSSProperties; key?: any }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    style={style}
    className={cn("geometric-card p-6", className)}
  >
    {children}
  </motion.div>
);

export const Button = ({ children, className, variant = 'primary', ...props }: any) => {
  const variants: any = {
    primary: 'geometric-btn text-dark-text shadow-sm hover:shadow-md h-12',
    secondary: 'bg-energy-orange text-dark-text hover:opacity-90 h-12',
    danger: 'bg-severe-red text-red-900 hover:bg-opacity-90 h-12',
    outline: 'border-2 border-trust-blue text-dark-text hover:bg-trust-blue/10 h-12'
  };
  return (
    <button
      className={cn("px-6 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2", variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
};

export const Input = ({ label, icon: Icon, error, className, ...props }: any) => (
  <div className="space-y-1.5 w-full">
    {label && (
      <label className="text-sm font-bold text-gray-600 ml-1 flex items-center justify-between">
        <span>{label}</span>
        {error && <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider animate-pulse">⚠️ {error}</span>}
      </label>
    )}
    <div className="relative group">
      {Icon && <Icon className={cn(
        "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors",
        error ? "text-red-400" : "text-gray-400 group-focus-within:text-[#A0C4FF]"
      )} />}
      <input
        className={cn(
          "w-full bg-white border rounded-2xl py-3.5 outline-none transition-all duration-300",
          "placeholder:text-gray-300 font-medium text-dark-text",
          Icon ? "pl-11 pr-4" : "px-5",
          error 
            ? "border-red-300 focus:ring-4 focus:ring-red-100 bg-red-50/10" 
            : "border-gray-100 hover:border-gray-200 focus:ring-4 focus:ring-trust-blue/10 focus:border-trust-blue",
          className
        )}
        {...props}
      />
    </div>
  </div>
);
