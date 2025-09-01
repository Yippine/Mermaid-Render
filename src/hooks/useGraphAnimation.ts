import { useState, useCallback, useRef, useMemo } from 'react'
import { AnimationState } from '@/types/mermaid.types'

export interface GraphAnimation {
  duration: number
  easing: string
  delay: number
}

export interface UseGraphAnimationReturn {
  animationState: AnimationState
  currentStep: number
  totalSteps: number
  progress: number
  playSequence: (steps: string[], animation?: GraphAnimation) => Promise<void>
  pause: () => void
  resume: () => void
  stop: () => void
  goToStep: (step: number) => void
}

export const useGraphAnimation = (): UseGraphAnimationReturn => {
  const [animationState, setAnimationState] = useState<AnimationState>('idle')
  const [currentStep, setCurrentStep] = useState(0)
  const [totalSteps, setTotalSteps] = useState(0)

  const animationRef = useRef<{
    steps: string[]
    currentIndex: number
    timeouts: NodeJS.Timeout[]
    isPaused: boolean
    pausedAt: number
    startTime: number
    animation: GraphAnimation
  }>()

  const defaultAnimation = useMemo(
    (): GraphAnimation => ({
      duration: 1000,
      easing: 'ease-in-out',
      delay: 500,
    }),
    []
  )

  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0

  const clearTimeouts = useCallback(() => {
    if (animationRef.current?.timeouts) {
      animationRef.current.timeouts.forEach(clearTimeout)
      animationRef.current.timeouts = []
    }
  }, [])

  const playSequence = useCallback(
    async (steps: string[], animation?: GraphAnimation): Promise<void> => {
      const animationConfig = animation || defaultAnimation
      return new Promise(resolve => {
        // Stop any existing animation
        clearTimeouts()

        setAnimationState('playing')
        setTotalSteps(steps.length)
        setCurrentStep(0)

        animationRef.current = {
          steps,
          currentIndex: 0,
          timeouts: [],
          isPaused: false,
          pausedAt: 0,
          startTime: Date.now(),
          animation: animationConfig,
        }

        const executeStep = (index: number) => {
          if (!animationRef.current || animationRef.current.isPaused) {
            return
          }

          if (index >= steps.length) {
            setAnimationState('completed')
            setCurrentStep(steps.length)
            resolve()
            return
          }

          setCurrentStep(index + 1)

          // Simulate animation step execution
          const timeout = setTimeout(() => {
            if (animationRef.current && !animationRef.current.isPaused) {
              executeStep(index + 1)
            }
          }, animationConfig.duration + animationConfig.delay)

          animationRef.current.timeouts.push(timeout)
        }

        executeStep(0)
      })
    },
    [clearTimeouts, defaultAnimation]
  )

  const pause = useCallback(() => {
    if (animationRef.current && animationState === 'playing') {
      setAnimationState('paused')
      animationRef.current.isPaused = true
      animationRef.current.pausedAt = Date.now()
      clearTimeouts()
    }
  }, [animationState, clearTimeouts])

  const resume = useCallback(() => {
    if (animationRef.current && animationState === 'paused') {
      setAnimationState('playing')
      animationRef.current.isPaused = false

      const remainingSteps = animationRef.current.steps.slice(currentStep)

      const executeStep = (index: number) => {
        if (!animationRef.current || animationRef.current.isPaused) {
          return
        }

        if (index >= remainingSteps.length) {
          setAnimationState('completed')
          return
        }

        setCurrentStep(currentStep + index + 1)

        const timeout = setTimeout(() => {
          if (animationRef.current && !animationRef.current.isPaused) {
            executeStep(index + 1)
          }
        }, animationRef.current.animation.duration + animationRef.current.animation.delay)

        animationRef.current.timeouts.push(timeout)
      }

      executeStep(0)
    }
  }, [animationState, currentStep])

  const stop = useCallback(() => {
    clearTimeouts()
    setAnimationState('idle')
    setCurrentStep(0)
    setTotalSteps(0)
    animationRef.current = undefined
  }, [clearTimeouts])

  const goToStep = useCallback(
    (step: number) => {
      if (animationRef.current && step >= 0 && step <= totalSteps) {
        clearTimeouts()
        setCurrentStep(step)

        if (step === totalSteps) {
          setAnimationState('completed')
        } else if (animationState === 'completed') {
          setAnimationState('paused')
        }
      }
    },
    [totalSteps, animationState, clearTimeouts]
  )

  return {
    animationState,
    currentStep,
    totalSteps,
    progress,
    playSequence,
    pause,
    resume,
    stop,
    goToStep,
  }
}
