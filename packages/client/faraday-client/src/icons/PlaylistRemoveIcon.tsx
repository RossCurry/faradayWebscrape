import React from 'react'

export default function PlaylistRemoveIcon(props?: React.SVGProps<SVGSVGElement>) {
  const { fill } = props || {}
  return (
    <svg 
    xmlns="http://www.w3.org/2000/svg" 
    height="24px" 
    viewBox="0 -960 960 960" 
    width="24px" 
    fill={fill || "#e8eaed"}
    >
      <path d="m576-80-56-56 104-104-104-104 56-56 104 104 104-104 56 56-104 104 104 104-56 56-104-104L576-80ZM120-320v-80h280v80H120Zm0-160v-80h440v80H120Zm0-160v-80h440v80H120Z"/>
    </svg>
  )
}
