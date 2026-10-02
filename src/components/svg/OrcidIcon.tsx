import React from 'react';
import PropTypes from 'prop-types';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export function OrcidIcon({ className = 'w-5 h-5', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 256 256"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M128 0C57.31 0 0 57.31 0 128s57.31 128 128 128 128-57.31 128-128S198.69 0 128 0z"
        fill="#A6CE39"
      />
      <path
        d="M86.3 186.2H70.9V79.1h15.4v107.1zM78.6 62.2c-5.5 0-9.9-4.4-9.9-9.9s4.4-9.9 9.9-9.9 9.9 4.4 9.9 9.9-4.4 9.9-9.9 9.9zM108.9 79.1h41.6c39.6 0 57.1 28.3 57.1 53.6 0 27.5-20 53.5-56.8 53.5h-41.9V79.1zm15.4 93.3h24.7c26.9 0 43.1-15.6 43.1-39.7 0-22.3-15.1-39.8-42.3-39.8h-25.5v79.5z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

OrcidIcon.propTypes = {
  className: PropTypes.string,
};
