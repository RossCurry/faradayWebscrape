import React from 'react'
import styles from './Tooltip.module.css'
import { useIsMobile } from '../../../hooks/useIsMobile'

type TooltipProps = {
  Component: React.ReactElement,
  tooltipText: string,
  componentStyle?: React.CSSProperties,
  hideTooltip?: boolean
  position?: 'right' | 'left' 
}
export default function Tooltip({ Component, tooltipText, componentStyle = {}, hideTooltip, position = 'left'}: TooltipProps) {
  const popoverId = `popover-id-${React.useId()}`
  const anchorNameId = `--anchor-id-${React.useId()}`
  const isMobile = useIsMobile()

  return (
    <div
      className={styles.tooltip}
      popoverTarget={popoverId}
      style={{ ...componentStyle, ['anchor-name']: anchorNameId } as unknown as React.CSSProperties}
    >
      {Component}
      {isMobile || hideTooltip ? null :
      <div 
        className={`
          ${styles.popover}
          ${position === 'right' ? styles.popoverRight : styles.popoverLeft}
        `} 
        id={popoverId} 
        role='tooltip' 
        popover={'auto'}
      >
        <p>{tooltipText}</p>
      </div>
      }
    </div>
  )
}
