import React from 'react'

export default function PauseIcon(props?: React.SVGProps<SVGSVGElement>) {
  const { fill } = props || {}
  return (
    <svg 
    xmlns="http://www.w3.org/2000/svg" 
    height="24px" 
    viewBox="0 -960 960 960" 
    width="24px" 
    fill={fill || "#e8eaed"}
    >
      <path d="M590-220q-24.54 0-42.27-17.73Q530-255.46 530-280v-400q0-24.54 17.73-42.27Q565.46-740 590-740h90q24.54 0 42.27 17.73Q740-704.54 740-680v400q0 24.54-17.73 42.27Q704.54-220 680-220h-90Zm-310 0q-24.54 0-42.27-17.73Q220-255.46 220-280v-400q0-24.54 17.73-42.27Q255.46-740 280-740h90q24.54 0 42.27 17.73Q430-704.54 430-680v400q0 24.54-17.73 42.27Q394.54-220 370-220h-90Zm310-60h90v-400h-90v400Zm-310 0h90v-400h-90v400Zm0-400v400-400Zm310 0v400-400Z"/>
    </svg>
  )
}
