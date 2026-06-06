import { useLang } from '../contexts/LangContext'

interface Props {
  count: number
}

export default function LiveIndicator({ count }: Props) {
  const { t } = useLang()
  return (
    <div className="live_indicator">
      <div className="dot" />
      <span>{t('live.online')} <span>{count}</span></span>
    </div>
  )
}
