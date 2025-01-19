import React from 'react'
import styles from './IconButton.module.css'
import Tooltip from '../Tooltip/Tooltip'
import IconButton from '../IconButton/IconButton'


type IconButtonWithTooltipProps = {
  handleOnClick: () => void,
  isSelected?: boolean,
  Icon: React.FC,
  text: string,
  className?: CSSModuleClasses
}
export default function IconButtonWithTooltip({ 
  handleOnClick, 
  isSelected, 
  Icon, 
  text, 
  className 
}: IconButtonWithTooltipProps) {

  return (
    <>
      <Tooltip 
        Component={
          <IconButton
            handleOnClick={handleOnClick}
            isSelected={isSelected}
            Icon={Icon}
            text={''}
            className={className} 
          />
        } 
        tooltipText={text}      
      />
    </>
  )
}
