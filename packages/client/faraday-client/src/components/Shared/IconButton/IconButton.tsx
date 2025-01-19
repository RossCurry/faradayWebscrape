import React from 'react'
import styles from './IconButton.module.css'


type IconButtonProps = {
  handleOnClick: () => void,
  isSelected?: boolean,
  Icon: React.FC,
  text: string,
  className?: string
  disabled?: boolean
}
export default function IconButton({ 
  handleOnClick, 
  isSelected, 
  Icon, 
  text, 
  className,
  disabled,
}: IconButtonProps) {
  return (
    <button
      className={`
        ${styles.IconButton}  
        ${isSelected ? styles.IconButtonSelected : ''}
        ${className ? className : ''}
      `}
      onClick={handleOnClick}
      disabled={disabled}
    >
      <span>
        <Icon />
        <h4>{text}</h4>
      </span>
    </button>
  )
}
