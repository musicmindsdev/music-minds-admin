import React from 'react'

function AuthLayout({children}: {
  children: React.ReactNode
}) {
  return (
    <div className='h-full flex items-center justify-center bg-background pt-6'>{children}</div>
  )
}

export default AuthLayout