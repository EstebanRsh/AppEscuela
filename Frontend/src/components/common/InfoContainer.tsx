import React from 'react';

// Definimos las props que recibirá el componente
interface InfoContainerProps {
  children: React.ReactNode; // Contenido a mostrar dentro del contenedor
  title: string;             // Un título para el contenedor
  className?: string;        // Clases CSS adicionales para personalizar
  titleClassName?: string;   // Clases para el título
  bodyClassName?: string;    // Clases para el cuerpo del contenedor
}

/**
 * Un componente contenedor reutilizable con estilo de Bootstrap.
 * Utiliza el sistema de cards de Bootstrap para un diseño limpio.
 */
const InfoContainer: React.FC<InfoContainerProps> = ({
  children,
  title,
  className = 'shadow-sm mb-4', // Sombra suave y margen inferior por defecto
  titleClassName = 'text-primary', // Título en color primario de Bootstrap
  bodyClassName = ''
}) => {
  // Clases base de la card de Bootstrap + clases personalizadas
  const containerClasses = `card ${className}`;
  const titleClasses = `card-header h5 ${titleClassName}`;
  const bodyClasses = `card-body ${bodyClassName}`;

  return (
    <div className={containerClasses}>
      {/* El título se renderiza en el encabezado de la card */}
      <div className={titleClasses}>
        {title}
      </div>
      {/* El contenido (children) se renderiza en el cuerpo de la card */}
      <div className={bodyClasses}>
        {children}
      </div>
    </div>
  );
};

export default InfoContainer;