import { useContext } from 'react'
import { CyclesContext } from '../../contexts/CylesContext'
import { HistoryContainer, HistoryList, Status } from './styles'
import { formatDistanceToNow } from 'date-fns'
import ptBr from 'date-fns/locale/pt-BR'

export function History() {
  const { cycles } = useContext(CyclesContext)

  return (
    <HistoryContainer>
      <h1>Meu histórico</h1>

      <HistoryList>
        <table>
          <thead>
            <tr>
              <th>Tarefa</th>
              <th>Duração</th>
              <th>Início</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {cycles.map((cycle) => {
              const status = cycle.interruptedDate
                ? 'Interrompido'
                : cycle.finishedDate
                ? 'Concluído'
                : 'Em andamento'
              const statusColor =
                status === 'Interrompido'
                  ? 'red'
                  : status === 'Concluído'
                  ? 'green'
                  : 'yellow'
              return (
                <tr key={cycle.id}>
                  <td>{cycle.task}</td>
                  <td>{cycle.minutesAmount + ' minutos'}</td>
                  <td>
                    {formatDistanceToNow(cycle.startDate, {
                      locale: ptBr,
                      addSuffix: true,
                    })}
                  </td>
                  <td>
                    <Status statusColor={statusColor}>{status}</Status>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </HistoryList>
    </HistoryContainer>
  )
}
