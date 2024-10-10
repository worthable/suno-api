import { Status } from '../enums/Status'

export interface IClip {
  id: string
  status: Status
  videoUrl: string
  audioUrl: string
  imageUrl: string
  imageLargeUrl: string
  isVideoPending: boolean
  majorModelVersion: string
  modelName: string
  metadata: {
    tags: string
    prompt: string
    type: string
    duration: number
    refundCredits: boolean
    stream: boolean
  }
  isLiked: boolean
  userId: string
  displayName: string
  handle: string
  isHandleUpdated: boolean
  avatarImageUrl: string
  isTrashed: boolean
  reaction: {
    playCount: number
    skipCount: number
    flagged: boolean
    clip: string
    updatedAt: string
  }
  createdAt: string
  title: string
  playCount: number
  upvoteCount: number
  isPublic: boolean
}
