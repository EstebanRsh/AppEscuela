import React from 'react';

interface InfoContainerProps {
  children: React.ReactNode;
  
  className?: string;
}

const InfoContainer: React.FC<InfoContainerProps> = ({ children, className = '' }) => {
  const containerClasses = `info-container ${className}`;

  return (
    <div className={containerClasses}>
      <div className="flex-grow-1">
        {children}
      </div>
    </div>
  );
};

export default InfoContainer;