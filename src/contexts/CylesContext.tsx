import { createContext, useState } from 'react'

interface CreateCycleData {
  task: string
  minutesAmount: number
}

interface Cycle {
  id: string
  task: string
  minutesAmount: number
  startDate: Date
  interruptedDate?: Date
  finishedDate?: Date
}

interface CyclesContextType {
  cycles: Cycle[]
  activeCycle: Cycle | undefined
  activeCycleId: string | null
  amountSecondsPassed: number
  markCurrentCycleAsFinished: () => void
  markCurrentCycleAsInterrupted: () => void
  setSecondsPassed: (seconds: number) => void
  createNewCycle: (data: CreateCycleData) => void
  interruptCurrentCycle: () => void
}

interface CyclesContextProviderProps {
  children: React.ReactNode
}

export const CyclesContext = createContext({} as CyclesContextType)

export function CyclesContextProvider({
  children,
}: CyclesContextProviderProps) {
  // States
  const [cycles, setCycles] = useState<Cycle[]>([])
  const [activeCycleId, setActiveCycleId] = useState<string | null>(null)
  const [amountSecondsPassed, setAmountSecondsPassed] = useState(0)

  // Gets the active cycle
  const activeCycle = cycles.find((cycle) => cycle.id === activeCycleId)

  // Marks the current cycle as finished
  function markCurrentCycleAsFinished() {
    setCycles((state) =>
      state.map((cycle) => {
        if (cycle.id === activeCycleId) {
          return {
            ...cycle,
            finishedDate: new Date(),
          }
        }
        return cycle
      }),
    )
  }

  // Marks the current cycle as interrupted
  function markCurrentCycleAsInterrupted() {
    setCycles((state) =>
      state.map((cycle) => {
        if (cycle.id === activeCycleId)
          return { ...cycle, interruptedDate: new Date() }
        else return cycle
      }),
    )
  }

  // Proxies the function to send it to the Context
  function setSecondsPassed(seconds: number) {
    setAmountSecondsPassed(seconds)
  }

  // Handles the creation of a new cycle
  function createNewCycle(data: CreateCycleData) {
    const newCycle: Cycle = {
      id: String(new Date().getTime()),
      task: data.task,
      minutesAmount: data.minutesAmount,
      startDate: new Date(),
    }
    setCycles((state) => [newCycle, ...state])
    setActiveCycleId(newCycle.id)
    setAmountSecondsPassed(0)
  }

  // Handles the interruption of a cycle
  function interruptCurrentCycle() {
    setCycles((state) =>
      state.map((cycle) => {
        if (cycle.id === activeCycleId)
          return { ...cycle, interruptedDate: new Date() }
        else return cycle
      }),
    )

    setActiveCycleId(null)
    setAmountSecondsPassed(0)
    // reset()
  }

  // Values of the context
  const cyclesContextValue = {
    cycles,
    activeCycle,
    activeCycleId,
    amountSecondsPassed,
    markCurrentCycleAsFinished,
    markCurrentCycleAsInterrupted,
    setSecondsPassed,
    createNewCycle,
    interruptCurrentCycle,
  }

  return (
    <CyclesContext.Provider value={cyclesContextValue}>
      {children}
    </CyclesContext.Provider>
  )
}
