import { useLang } from '../contexts/LangContext'

interface Props {
  onStart: () => void
}

export default function StartScreen({ onStart }: Props) {
  const { t } = useLang()
  return (
    <div className="fresh">
      <h1>{t('start.headline')}</h1>
      <button className="btn" onClick={onStart}>{t('start.cta')}</button>
    </div>
  )
}
