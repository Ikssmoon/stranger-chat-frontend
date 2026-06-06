export interface Msg {
  id: string
  text: string
  direction: 'incoming' | 'outgoing'
  replaid: string       // '' = no reply quote
  myReaction: string    // '' = none
  theirReaction: string // '' = none
}
