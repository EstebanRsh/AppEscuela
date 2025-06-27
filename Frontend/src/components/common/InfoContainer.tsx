import React from 'react';

interface InfoContainerProps {
  children: React.ReactNode;
  
  className?: string;
}

const InfoContainer: React.FC<InfoContainerProps> = ({ children, className = '' }) => {
  const containerClasses = `info-container ${className}`;

  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
};

export default InfoContainer;