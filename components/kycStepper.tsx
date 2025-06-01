'use client'

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import Stepper1 from "./svg icons/stepper1"
import Stepper2 from "./svg icons/stepper1filled"
import Stepper3 from "./svg icons/stepper3"
import Stepper4 from "./svg icons/stepper4"

const steps = [
  {
    label: "Identity Verification",
  },
  {
    label: "Upload Certification",
  },
]

export default function KycStepper() {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length) return prev + 1
        clearInterval(interval)
        return prev
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const getStepStyle = (index: number) => {
    if (index < currentStep) return "bg-[#5243FE] text-white"
    if (index === currentStep) return "border-2 border-[#D3CFFF] text-primary"
    return "border border-muted text-muted-foreground"
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Step Icons + Animated Connector */}
      <div className="flex items-center w-full max-w-sm justify-between relative">
        {/* Step 1 */}
        <div className="z-10">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
              getStepStyle(0)
            )}
          >
            {currentStep > 0 ? <Stepper2 className="w-5 h-5" /> : <Stepper1 className="w-5 h-5" />}
          </div>
        </div>

        {/* Connector */}
        <div className="absolute left-[40px] right-[40px] top-1/2 h-0.5 bg-[#D3CFFF] z-0 overflow-hidden">
          <div
            className="h-full bg-[#5243FE] transition-all duration-700"
            style={{
              width:
                currentStep === 0
                  ? "0%"
                  : currentStep === 1
                  ? "50%"
                  : "100%",
            }}
          />
        </div>

        {/* Step 2 */}
        <div className="z-10">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
              getStepStyle(1)
            )}
          >
            {currentStep > 1 ? <Stepper4 className="w-5 h-5" /> : <Stepper3 className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between w-full max-w-sm px-1">
        {steps.map((step, index) => (
          <div
            key={index}
            className={cn(
              "text-sm text-center transition-colors duration-300",
              index < currentStep ? "text-primary font-medium" : "text-muted-foreground"
            )}
            style={{ width: "" }}
          >
            {step.label}
          </div>
        ))}
      </div>
    </div>
  )
}