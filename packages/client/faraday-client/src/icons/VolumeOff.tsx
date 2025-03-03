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
      <path d="M658.31-195.08q-9.85 6.23-20.08 11.85Q628-177.62 617.15-173q-11.15 5.08-23.19 0-12.04-5.08-16.5-16.85-4.46-11.15 1.31-22.19 5.77-11.04 16.92-16.11 5.16-2.39 9.81-4.77 4.65-2.39 9.42-5.54L471.54-381.85V-282q0 20.46-18.73 28.27-18.73 7.8-33.12-6.58L300-380H187.69q-15.46 0-25.8-10.35-10.35-10.34-10.35-25.81v-127.68q0-15.47 10.35-25.81Q172.23-580 187.69-580h85.7L100.92-752.46q-8.3-8.31-8.5-20.88-.19-12.58 8.5-21.27 8.7-8.7 21.08-8.7 12.39 0 21.08 8.7L800-137.69q8.31 8.31 8.5 20.88.19 12.58-8.5 21.27t-21.08 8.69q-12.38 0-21.07-8.69l-99.54-99.54ZM759.23-481q0-82.23-44.19-150.54-44.19-68.31-118.58-101.92-11.54-5.46-17-16.31-5.46-10.84-1.23-22 4.85-12.15 17.08-16.84 12.23-4.7 24.77.77 90.46 41.07 144.8 123.3 54.35 82.23 54.35 183.54 0 38.39-8.89 74.73-8.88 36.35-25.65 69.04-6.85 16.23-19.12 20-12.26 3.77-22.8-.08-10.54-3.84-16.35-13.77-5.81-9.92.27-22.3 16.39-29.46 24.46-60.97 8.08-31.5 8.08-66.65ZM594.46-609.15q28 21.38 42.54 58 14.54 36.61 14.54 71.15 0 8.85-.96 17.5-.97 8.65-3.5 17.12-2.77 11.46-13.81 14.5-11.04 3.03-19.89-5.81l-35.61-35.62q-5.62-5.61-8.23-12.15-2.62-6.54-2.62-13.77v-96.62q0-10.46 9.54-15.19 9.54-4.73 18 .89Zm-196.77-43.23q-5.61-5.62-5.42-12.85.19-7.23 5.81-12.84l21.61-21.62q14.39-14.38 33.12-6.58 18.73 7.81 18.73 28.27v55.69q0 12.47-11.04 17.27-11.04 4.81-19.89-4.42l-42.92-42.92ZM411.54-354v-87.85L333.39-520H211.54v80h114l86 86Zm-39.08-126.92Z"/>
    </svg>
  )
}
