import React from 'react';

interface LoadingWrapperProps {
  children: React.ReactNode;
}

const LoadingWrapper: React.FC<LoadingWrapperProps> = ({ children }) => {
  return <>{children}</>;
};

export default LoadingWrapper;
