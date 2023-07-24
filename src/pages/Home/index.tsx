import { HandPalm, Play } from 'phosphor-react'
import { set, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { useEffect, useState } from 'react'
import { differenceInSeconds } from 'date-fns'

import {
  CountdownContainer,
  FormContainer,
  HomeContainer,
  MinutesAmountInput,
  Separator,
  StartCountdownButton,
  StopCountdownButton,
  TaskInput,
} from './styles'

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

export function Home() {
  // States
  const [cycles, setCycles] = useState<Cycle[]>([])
  const [activeCycleId, setActiveCycleId] = useState<string | null>(null)
  const [amountSecondsPassed, setAmountSecondsPassed] = useState(0)

  // Form handling
  const { register, handleSubmit, watch, reset, formState } =
    useForm<newCountdownFormData>({
      resolver: zodResolver(newCountdownSchema),
      defaultValues: {
        task: '',
        minutesAmount: 0,
      },
    })

  // Gets the active cycle
  const activeCycle = cycles.find((cycle) => cycle.id === activeCycleId)

  // Variables needed to display the countdown
  const totalSeconds = activeCycle ? activeCycle.minutesAmount * 60 : 0
  const currentSeconds = activeCycle ? totalSeconds - amountSecondsPassed : 0
  const minutesLeft = Math.floor(currentSeconds / 60)
  const secondsLeft = currentSeconds % 60
  const minutesLeftString = String(minutesLeft).padStart(2, '0')
  const secondsLeftString = String(secondsLeft).padStart(2, '0')

  // Reduces the countdown by 1 second every second
  useEffect(() => {
    let interval: number

    if (activeCycle) {
      interval = setInterval(() => {
        const secondsDifference = differenceInSeconds(
          new Date(),
          activeCycle.startDate,
        )

        if (secondsDifference >= totalSeconds) {
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

          setAmountSecondsPassed(totalSeconds)
          clearInterval(interval)
        } else {
          setAmountSecondsPassed(secondsDifference)
        }
      }, 1000)
    }

    return () => {
      clearInterval(interval)
    }
  }, [activeCycle, totalSeconds, cycles, activeCycleId])

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

  // Sets the title of the page to the countdown
  useEffect(() => {
    if (activeCycle) {
      document.title = `${minutesLeftString}:${secondsLeftString} - Pomodoro`
    }
  }, [minutesLeftString, secondsLeftString, activeCycle])

  // Form variables
  const task = watch('task')
  const minutesAmount = watch('minutesAmount')
  const isSubmitDisabled = !task || !minutesAmount

  return (
    <HomeContainer>
      <form onSubmit={handleSubmit(handleStartCountdown)} action="">
        <FormContainer>
          <label htmlFor="task">Vou trabalhar em</label>
          <TaskInput
            id="task"
            list="task-suggestions"
            placeholder="Nome do projeto"
            disabled={!!activeCycle}
            {...register('task')}
          />

          <datalist id="task-suggestions">
            <option value="Projeto 1" />
            <option value="Projeto 2" />
            <option value="Projeto 3" />
            <option value="Banana" />
          </datalist>

          <label htmlFor="minutesAmount">durante</label>
          <MinutesAmountInput
            type="number"
            id="minutesAmount"
            placeholder="00"
            step={5}
            min={5}
            max={60}
            disabled={!!activeCycle}
            {...register('minutesAmount', { valueAsNumber: true })}
          />
          <span>minutos.</span>
        </FormContainer>

        <CountdownContainer>
          <span>{minutesLeftString[0]}</span>
          <span>{minutesLeftString[1]}</span>
          <Separator>:</Separator>
          <span>{secondsLeftString[0]}</span>
          <span>{secondsLeftString[1]}</span>
        </CountdownContainer>

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
