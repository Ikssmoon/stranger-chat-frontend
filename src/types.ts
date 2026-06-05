export interface Msg {
  id: string
  text: string
  fromMe: boolean
  myReaction?: string       // reaction I placed on this message
  partnerReaction?: string  // reaction the partner placed on this message
}
