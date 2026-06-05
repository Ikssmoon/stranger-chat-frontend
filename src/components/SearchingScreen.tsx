import { useEffect, useState } from 'react'

const QUOTES = [
  "humans can form a first impression in under 100 milliseconds",
  "talking to strangers is proven to improve your mood",
  "most people are more interesting than they appear at first",
  "strangers become friends faster than you think",
  "awkward openers usually work better than smooth ones",
  "every conversation here disappears forever when you leave",
  "nobody knows who you are. keep it that way",
  "you can skip anyone, anytime, no explanation needed",
  "there are no profiles here. just people",
  "the person you're about to meet has no idea you exist yet",
  "your next best conversation might be 3 seconds away",
  "humans spend about 60% of conversations talking about themselves",
  "loneliness activates the same brain region as physical pain",
  "eye contact increases feelings of connection even with strangers",
  "the average person meets around 80,000 people in their lifetime",
]

interface Props {
  notice: string | null
}

export default function SearchingScreen({ notice }: Props) {
  const [quote, setQuote] = useState('')
  const [fade, setFade] = useState(false)

  function rotateQuote() {
    setFade(true)
    setTimeout(() => {
      setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)])
      setFade(false)
    }, 400)
  }

  useEffect(() => {
    rotateQuote()
    const interval = setInterval(rotateQuote, 6000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="searching">
      <span className="label">Did you know?</span>
      <h1 className={`quote${fade ? ' fade' : ''}`}>{quote}</h1>
      {notice && <span className="label">{notice}</span>}

      <div className="loader">
        <span>Searching</span>
        <svg className="spinner" width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.575 9.5C18.362 9.5 19.011 10.1415 18.8933 10.9197C18.6856 12.2942 18.1777 13.6124 17.399 14.7779C16.3551 16.3402 14.8714 17.5578 13.1355 18.2769C11.3996 18.9959 9.48947 19.184 7.64665 18.8175C5.80383 18.4509 4.11109 17.5461 2.78249 16.2175C1.45389 14.8889 0.549107 13.1962 0.182547 11.3534C-0.184012 9.51054 0.00411957 7.60041 0.723152 5.86451C1.44218 4.12861 2.65982 2.64491 4.22209 1.60104C5.38756 0.822294 6.70578 0.314421 8.08032 0.106672C8.85849 -0.0109416 9.50001 0.637994 9.50001 1.425C9.50001 2.21201 8.85487 2.83473 8.08586 3.0021C7.27583 3.17839 6.50171 3.50551 5.80547 3.97073C4.71188 4.70144 3.85953 5.74003 3.35621 6.95515C2.85289 8.17028 2.72119 9.50738 2.97779 10.7974C3.23438 12.0873 3.86773 13.2722 4.79775 14.2023C5.72777 15.1323 6.91268 15.7656 8.20266 16.0222C9.49263 16.2788 10.8297 16.1471 12.0449 15.6438C13.26 15.1405 14.2986 14.2881 15.0293 13.1945C15.4945 12.4983 15.8216 11.7242 15.9979 10.9141C16.1653 10.1451 16.788 9.5 17.575 9.5Z"/>
        </svg>
      </div>
    </div>
  )
}
