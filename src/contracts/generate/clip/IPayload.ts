export interface IPayload {
  prompt: string
  // default is false
  makeInstrumental?: boolean
  tags?: string
  title?: string
  // model
  mv?: string
}
