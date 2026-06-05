interface Props {
  count: number
}

export default function LiveIndicator({ count }: Props) {
  return (
    <div className="live_indicator">
      <div className="dot" />
      <span>Online <span>{count}</span></span>
    </div>
  )
}
