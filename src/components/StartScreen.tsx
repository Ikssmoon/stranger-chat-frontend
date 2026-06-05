interface Props {
  onStart: () => void
}

export default function StartScreen({ onStart }: Props) {
  return (
    <div className="fresh">
      <h1>Strangers are waiting</h1>
      <button className="btn" onClick={onStart}>Let's start</button>
    </div>
  )
}
