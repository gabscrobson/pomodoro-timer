import { HandPalm, Play } from 'phosphor-react'
import { FormProvider, set, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { createContext, useEffect, useState } from 'react'
import { differenceInSeconds } from 'date-fns'

import {
  HomeContainer,
  StartCountdownButton,
  StopCountdownButton,
} from './styles'
import { NewCycleForm } from './NewCycleForm'
import { Countdown } from './Countdown'

const newCountdownSchema = zod.object({
  task: zod.string().nonempty({ message: 'Campo obrigatório' }),
  minutesAmount: zod
    .number()
    .min(5, { message: 'Mínimo de 5 minutos' })
    .max(60, { message: 'Máximo de 60 minutos' }),
})

type newCountdownFormData = zod.infer<typeof newCountdownSchema>

interface Cycle {
  id: string
  task: string
  minutesAmount: number
  startDate: Date
  interruptedDate?: Date
}

interface CyclesContextType {
  activeCycle: Cycle | undefined
  activeCycleId: string | null
  amountSecondsPassed: number
  markCurrentCycleAsFinished: () => void
  markCurrentCycleAsInterrupted: () => void
  setSecondsPassed: (seconds: number) => void
}

export const CyclesContext = createContext({} as CyclesContextType)

export function Home() {
  // States
  const [cycles, setCycles] = useState<Cycle[]>([])
  const [activeCycleId, setActiveCycleId] = useState<string | null>(null)
  const [amountSecondsPassed, setAmountSecondsPassed] = useState(0)

  // Form handling
  const newCycleForm = useForm<newCountdownFormData>({
    resolver: zodResolver(newCountdownSchema),
    defaultValues: {
      task: '',
      minutesAmount: 0,
    },
  })

  const { register, handleSubmit, watch, reset } = newCycleForm

  // Gets the active cycle
  const activeCycle = cycles.find((cycle) => cycle.id === activeCycleId)

  function markCurrentCycleAsFinished() {
    setCycles((state) =>
      state.map((cycle) => {
        if (cycle.id === activeCycleId) {
          return {
            ...cycle,
            interruptedDate: new Date(),
          }
        }
        return cycle
      }),
    )
  }

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
  function handleStartCountdown(data: newCountdownFormData) {
    const newCycle: Cycle = {
      id: String(new Date().getTime()),
      task: data.task,
      minutesAmount: data.minutesAmount,
      startDate: new Date(),
    }
    setCycles((state) => [...state, newCycle])
    setActiveCycleId(newCycle.id)
    setAmountSecondsPassed(0)
  }

  // Handles the interruption of a cycle
  function handleInterruptCycle() {
    setCycles((state) =>
      state.map((cycle) => {
        if (cycle.id === activeCycleId)
          return { ...cycle, interruptedDate: new Date() }
        else return cycle
      }),
    )

    setActiveCycleId(null)
    setAmountSecondsPassed(0)
    reset()
  }

  // Form variables
  const task = watch('task')
  const minutesAmount = watch('minutesAmount')
  const isSubmitDisabled = !task || !minutesAmount

  const cyclesContextValue = {
    activeCycle,
    activeCycleId,
    amountSecondsPassed,
    markCurrentCycleAsFinished,
    markCurrentCycleAsInterrupted,
    setSecondsPassed,
  }

  return (
    <HomeContainer>
      <form onSubmit={handleSubmit(handleStartCountdown)} action="">
        <CyclesContext.Provider value={cyclesContextValue}>
          <FormProvider {...newCycleForm}>
            <NewCycleForm />
          </FormProvider>
          <Countdown />
        </CyclesContext.Provider>

        {activeCycle ? (
          <StopCountdownButton onClick={handleInterruptCycle} type="button">
            <HandPalm size={24} />
            Interromper
          </StopCountdownButton>
        ) : (
          <StartCountdownButton disabled={isSubmitDisabled} type="submit">
            <Play size={24} />
            Começar
          </StartCountdownButton>
        )}
      </form>
    </HomeContainer>
  )
}
