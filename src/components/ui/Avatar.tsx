import React, { useState } from 'react';

export interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base font-bold',
  xl: 'w-20 h-20 text-xl font-extrabold',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  const getInitials = (fullName: string) => {
    if (!fullName) return 'JP';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(name);

  // Deterministic gradient based on name
  const gradients = [
    'from-blue-600 to-indigo-600',
    'from-emerald-600 to-teal-600',
    'from-amber-600 to-orange-600',
    'from-rose-600 to-pink-600',
    'from-violet-600 to-purple-600',
  ];
  const charCode = name ? name.charCodeAt(0) : 0;
  const gradient = gradients[charCode % gradients.length];

  if (src && !hasError) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setHasError(true)}
        className={`${sizeClasses[size]} rounded-full object-cover border border-slate-200 shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${gradient} text-white flex items-center justify-center font-bold shadow-xs shrink-0 select-none ${className}`}
    >
      {initials}
    </div>
  );
};
