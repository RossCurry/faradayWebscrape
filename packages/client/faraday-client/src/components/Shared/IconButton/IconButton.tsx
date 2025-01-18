import React from 'react'
import styles from './IconButton.module.css'


type IconButtonProps = {
  handleOnClick: () => void,
  isSelected?: boolean,
  Icon: React.FC,
  text: string,
  className?: CSSModuleClasses
}
export default function IconButton({ 
  handleOnClick, 
  isSelected, 
  Icon, 
  text, 
  className 
}: IconButtonProps) {

  return (
    <button
      className={`
        ${styles.IconButton}  
        ${isSelected ? styles.IconButtonSelected : ''}
        ${className ? className : ''}
      `}
      onClick={handleOnClick}
    >
      <span>
        <Icon />
        <h4>{text}</h4>
      </span>
    </button>
  )
}
