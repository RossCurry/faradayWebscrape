import React from 'react'
import styles from './IconButton.module.css'


type IconButtonProps = {
  handleOnClick: () => void,
  isSelected?: boolean,
  Icon: React.FC,
  text: string,
  className?: string
  disabled?: boolean
  width?: number 
}
export default function IconButton({ 
  handleOnClick, 
  isSelected, 
  Icon, 
  text, 
  className,
  disabled,
  width
}: IconButtonProps) {
  return (
    <button
      className={`
        ${styles.IconButton}  
        ${isSelected ? styles.IconButtonSelected : ''}
        ${!text.length ? styles.noText : ''}
        ${className ? className : ''}
      `}
      onClick={handleOnClick}
      disabled={disabled}
      
    >
      <span style={!text.length ? { width: `${width || 24}px`} : {}}>
        <Icon />
        <h4>{text}</h4>
      </span>
    </button>
  )
}
