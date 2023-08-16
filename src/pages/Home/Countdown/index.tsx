import { useContext, useEffect, useState } from 'react'
import { CountdownContainer, Separator } from './styles'
import { differenceInSeconds } from 'date-fns'
import { CyclesContext } from '../../../contexts/CylesContext'

export function Countdown() {
  const {
    activeCycle,
    activeCycleId,
    markCurrentCycleAsFinished,
    amountSecondsPassed,
    setSecondsPassed,
  } = useContext(CyclesContext)

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
          markCurrentCycleAsFinished()

          setSecondsPassed(totalSeconds)
          clearInterval(interval)
        } else {
          setSecondsPassed(secondsDifference)
        }
      }, 1000)
    }

    return () => {
      clearInterval(interval)
    }
  }, [
    activeCycle,
    totalSeconds,
    activeCycleId,
    markCurrentCycleAsFinished,
    setSecondsPassed,
  ])

  // Sets the title of the page to the countdown
  useEffect(() => {
    if (activeCycle) {
      document.title = `${minutesLeftString}:${secondsLeftString} - Pomodoro`
    }
  }, [minutesLeftString, secondsLeftString, activeCycle])

  return (
    <CountdownContainer>
      <span>{minutesLeftString[0]}</span>
      <span>{minutesLeftString[1]}</span>
      <Separator>:</Separator>
      <span>{secondsLeftString[0]}</span>
      <span>{secondsLeftString[1]}</span>
    </CountdownContainer>
  )
}
