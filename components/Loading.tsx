import React from 'react'
import Load from './svg icons/Load'

function Loading() {
  return (
    <div className="relative w-17 p-5 h-17 mx-auto my-5 ">
    <div className="absolute inset-0 border-4 border-transparent border-t-[#5243FE] rounded-full animate-spin"></div>
    <div className="absolute inset-0 flex items-center m-3 justify-center">
      {/* this is the icon */}
      <Load />
    </div>
  </div>
  )
}

export default Loading