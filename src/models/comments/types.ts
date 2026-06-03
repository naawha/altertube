export type PipedCommentType = {
  author: string
  thumbnail: string
  commentId: string
  commentText: string
  commentedTime: string
  commentorUrl: string
  repliesPage: string | null
  likeCount: number
  replyCount: number
  hearted: boolean
  pinned: boolean
  verified: boolean
  creatorReplied: boolean
  channelOwner: boolean
}

export type PipedCommentsResponseType = {
  comments: PipedCommentType[]
  nextpage: string | null
  disabled: boolean
  commentCount: number
}
