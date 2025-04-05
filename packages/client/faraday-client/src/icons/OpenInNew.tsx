import React from 'react'

export default function OpenInNew(props?: React.SVGProps<SVGSVGElement>) {
  const { fill, width, height } = props || {}
  return (
    <svg 
    xmlns="http://www.w3.org/2000/svg" 
    height={height || "24px"}
    width={width || "24px"} 
    viewBox="0 -960 960 960" 
    fill={fill || "#e8eaed"}
    >
      <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h560v-280h80v280q0 33-23.5 56.5T760-120H200Zm188-212-56-56 372-372H560v-80h280v280h-80v-144L388-332Z"/>
    </svg>
  )
}
