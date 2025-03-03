import React from 'react'

export default function VolumeOff(props?: React.SVGProps<SVGSVGElement>) {
  const { fill } = props || {}
  return (
    <svg 
    xmlns="http://www.w3.org/2000/svg" 
    height="24px" 
    viewBox="0 -960 960 960" 
    width="24px" 
    fill={fill || "#e8eaed"}
    >
      <path d="M753.85-481q0-82.5-44.21-150.58-44.21-68.09-118.56-101.88-11.54-5.46-17-16.31-5.46-10.84-1.34-22.12 4.95-12.03 17.18-16.72 12.23-4.7 24.77.77 90.46 41.07 144.81 123.6 54.34 82.52 54.34 183.23 0 100.7-54.34 183.24-54.35 82.54-144.81 123.61-12.54 5.47-24.77.77-12.23-4.69-17.18-16.72-4.12-11.28 1.34-22.12 5.46-10.85 17-16.31 74.35-33.79 118.56-101.88Q753.85-398.5 753.85-481ZM294.62-380H182.31q-15.37 0-25.76-10.4-10.39-10.39-10.39-25.76v-127.68q0-15.37 10.39-25.76 10.39-10.4 25.76-10.4h112.31l119.69-119.69q14.38-14.38 33.11-6.49 18.73 7.89 18.73 28.18v396q0 20.29-18.73 28.18-18.73 7.89-33.11-6.49L294.62-380Zm351.53-99.96q0 37.43-15.54 70.85-15.53 33.42-41.88 56.19-8.5 5.69-17.85 1.15-9.34-4.54-9.34-15v-228.46q0-10.46 9.34-15 9.35-4.54 17.85 1.09 26.35 23.45 41.88 57.6 15.54 34.16 15.54 71.58ZM406.15-606l-86 86h-114v80h114l86 86v-252Zm-100 126Z"/>
    </svg>
  )
}
