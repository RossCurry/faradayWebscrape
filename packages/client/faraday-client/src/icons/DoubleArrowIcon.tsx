import React from 'react'

export default function DoubleArrowIcon(props?: React.SVGProps<SVGSVGElement>) {
  const { fill, width, height } = props || {}
  return (
    <svg 
    xmlns="http://www.w3.org/2000/svg" 
    height={height || "24px"}
    width={width || "24px"} 
    viewBox="0 -960 960 960" 
    fill={fill || "#e8eaed"}
    >
      <path d="M383-480 200-664l56-56 240 240-240 240-56-56 183-184Zm264 0L464-664l56-56 240 240-240 240-56-56 183-184Z"/>
    </svg>
  )
}
