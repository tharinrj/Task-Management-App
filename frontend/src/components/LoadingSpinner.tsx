'use client';

export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex items-center justify-center p-8">
      <div
        className={`${sizeClasses[size]} rounded-full border-transparent animate-spin`}
        style={{
          borderTopColor: '#7c3aed',
          borderRightColor: '#06b6d4',
          borderWidth: size === 'sm' ? '2px' : size === 'md' ? '3px' : '4px',
          borderBottomColor: 'transparent',
          borderLeftColor: 'transparent',
        }}
      />
    </div>
  );
}
