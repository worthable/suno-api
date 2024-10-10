import { Status } from '../enums/Status'

export interface ILyrics {
  id: string
  status: Status
  text: string
  title: string
}
