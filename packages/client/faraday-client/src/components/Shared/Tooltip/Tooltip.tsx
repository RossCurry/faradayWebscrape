import React from 'react'
import styles from './Tooltip.module.css'

type TooltipProps = {
  Component: React.ReactElement,
  tooltipText: string,
  componentStyle?: React.CSSProperties
}
export default function Tooltip({ Component, tooltipText, componentStyle = {} }: TooltipProps) {
  const popoverId = `popover-id-${React.useId()}`
  const anchorNameId = `--anchor-id-${React.useId()}`

  return (
    <div
      className={styles.tooltip}
      popoverTarget={popoverId}
      style={{ ...componentStyle, ['anchor-name']: anchorNameId } as unknown as React.CSSProperties}
    >
      {Component}
      <div className={styles.popover} id={popoverId} role='tooltip' popover={'auto'}>
        <p>{tooltipText}</p>
      </div>
    </div>
  )
}
