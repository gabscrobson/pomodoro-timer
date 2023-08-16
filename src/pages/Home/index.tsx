import { HandPalm, Play } from 'phosphor-react'
import { FormProvider, set, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { useContext } from 'react'
import { differenceInSeconds } from 'date-fns'

import {
  HomeContainer,
  StartCountdownButton,
  StopCountdownButton,
} from './styles'
import { NewCycleForm } from './NewCycleForm'
import { Countdown } from './Countdown'
import { CyclesContext } from '../../contexts/CylesContext'

const newCountdownSchema = zod.object({
  task: zod.string().nonempty({ message: 'Campo obrigatório' }),
  minutesAmount: zod
    .number()
    .min(5, { message: 'Mínimo de 5 minutos' })
    .max(60, { message: 'Máximo de 60 minutos' }),
})

type newCountdownFormData = zod.infer<typeof newCountdownSchema>

export function Home() {
  const { activeCycle, activeCycleId, createNewCycle, interruptCurrentCycle } =
    useContext(CyclesContext)

  // Form handling
  const newCycleForm = useForm<newCountdownFormData>({
    resolver: zodResolver(newCountdownSchema),
    defaultValues: {
      task: '',
      minutesAmount: 0,
    },
  })

  const { register, handleSubmit, watch, reset } = newCycleForm

  // Form variables
  const task = watch('task')
  const minutesAmount = watch('minutesAmount')
  const isSubmitDisabled = !task || !minutesAmount

  function handleCreateNewCycle() {
    createNewCycle({
      task,
      minutesAmount,
    })
    reset()
  }

  return (
    <HomeContainer>
      <form onSubmit={handleSubmit(handleCreateNewCycle)} action="">
        <FormProvider {...newCycleForm}>
          <NewCycleForm />
        </FormProvider>
        <Countdown />

        {activeCycle ? (
          <StopCountdownButton onClick={interruptCurrentCycle} type="button">
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
