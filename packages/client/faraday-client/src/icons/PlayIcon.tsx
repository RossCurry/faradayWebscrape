import React from 'react'

export default function PlayIcon(props?: React.SVGProps<SVGSVGElement>) {
  const { fill } = props || {}
  return (
    <svg 
    xmlns="http://www.w3.org/2000/svg" 
    height="24px" 
    viewBox="0 -960 960 960" 
    width="24px" 
    fill={fill || "#e8eaed"}
    >
      <path d="M340-302.23v-355.54q0-15.84 10.85-26 10.84-10.15 25.31-10.15 4.61 0 9.53 1.31 4.93 1.3 9.54 3.92l279.84 178.15q8.24 5.62 12.35 13.46 4.12 7.85 4.12 17.08 0 9.23-4.12 17.08-4.11 7.84-12.35 13.46L395.23-271.31q-4.61 2.62-9.54 3.92-4.92 1.31-9.53 1.31-14.47 0-25.31-10.15-10.85-10.16-10.85-26ZM400-480Zm0 134 210.77-134L400-614v268Z"/>
    </svg>
  )
}
