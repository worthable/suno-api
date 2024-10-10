import { Status } from '../../enums/Status'

export interface IOptions {
  wait?: boolean
  waitStatuses?: Status[]
  // timeout in ms to wait max
  waitTimeout?: number
  waitSleepRange?: number[]
}
