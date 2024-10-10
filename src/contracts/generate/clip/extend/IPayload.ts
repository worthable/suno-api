import { IPayload as IBase } from '../IPayload'

export interface IPayload extends IBase {
  // The ID of the audio clip to extend.
  continueClipId: string
  // Extend a new clip from a song at mm:ss(e.g. 00:30). Default extends from the end of the song.
  continueAt: string
}
