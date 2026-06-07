export interface Msg {
  id: string
  text: string
  direction: 'incoming' | 'outgoing'
  replaid: string       // '' = no reply quote
  myReaction: string    // '' = none
  theirReaction: string // '' = none
  linkState?: 'pending' | 'revealed'
  linkPlatform?: string
  linkUrl?: string      // only populated after social_reveal
}
