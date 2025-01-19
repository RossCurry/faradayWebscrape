import React from 'react'
import styles from './Tooltip.module.css'

type TooltipProps = {
  Component: React.ReactElement,
  tooltipText: string,
}
export default function Tooltip({ Component, tooltipText }: TooltipProps) {
  const popoverId = `popover-id-${React.useId()}`
  return (
    <div popoverTarget={popoverId} className={styles.tooltip}>
      {Component}
      <div className={styles.popover} id={popoverId} role='tooltip' popover={'auto'}> 
        <p>{tooltipText}</p>
      </div>
    </div>
  )
}
