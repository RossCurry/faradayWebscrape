import React from 'react'

export default function RemoveIcon(props?: React.SVGProps<SVGSVGElement>) {
  const { fill } = props || {}
  return (
    <svg 
    xmlns="http://www.w3.org/2000/svg" 
    height="24px" 
    viewBox="0 -960 960 960" 
    width="24px" 
    fill={fill || "#e8eaed"}
    >
      <path d="M200-440v-80h560v80H200Z"/>
    </svg>
  )
}
