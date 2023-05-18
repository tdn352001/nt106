import cx from 'classnames';
import { ButtonHTMLAttributes } from 'react';

const Button = ({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      className={cx(
        'text-gray-100 font-semibold font-display tracking-wide',
        'bg-primary/90 py-1 px-8 rounded-full shadow-lg',
        'transition-colors',
        'focus:outline-none focus:shadow-outline',
        'hover:bg-indigo-600 hove:text-white',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
