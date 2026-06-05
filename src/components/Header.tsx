type FilterGender = 'male' | 'female' | 'any'

interface Props {
  filterOpen: boolean
  iAm: FilterGender
  lookingFor: FilterGender
  dimmed: boolean
  onFilterToggle: () => void
  onIAmChange: (v: FilterGender) => void
  onLookingForChange: (v: FilterGender) => void
  onFindNext: () => void
  onBlock: () => void
  onLeave: () => void
}

export default function Header({
  filterOpen, iAm, lookingFor, dimmed,
  onFilterToggle, onIAmChange, onLookingForChange,
  onFindNext, onBlock, onLeave,
}: Props) {
  const dimClass = dimmed ? ' btn_dimm' : ''

  return (
    <div className="header">

      <div className="actions">
        <div className="start">
          <button
            className={`btn btn_icon btn_settings btn_default${filterOpen ? ' opened' : ''}`}
            onClick={onFilterToggle}
            data-tooltip="Filter"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 20V13H3V11H9V13H7V20H5ZM5 9V4H7V9H5ZM9 9V7H11V4H13V7H15V9H9ZM11 20V11H13V20H11ZM17 20V17H15V15H21V17H19V20H17ZM17 13V4H19V13H17Z"/>
            </svg>
            <svg className="chevron" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.99998 11.3934L5.00342 7.39688H12.9965L8.99998 11.3934Z"/>
            </svg>
          </button>

          <button className={`btn btn_skip dimmer${dimClass}`} onClick={onFindNext}>
            Find next
          </button>
        </div>

        <div className="end">
          <button className={`btn btn_icon btn_warning dimmer${dimClass}`} onClick={onBlock} data-tooltip="Block">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.02225 21.3978C6.78175 20.8609 5.7015 20.1325 4.7815 19.2125C3.86167 18.2925 3.13425 17.2115 2.59925 15.9695C2.06425 14.7275 1.79675 13.4003 1.79675 11.988C1.79675 10.5782 2.06459 9.25334 2.60025 8.0135C3.13592 6.7735 3.86284 5.69492 4.781 4.77775C5.69934 3.86042 6.77917 3.13425 8.0205 2.59925C9.26184 2.06425 10.5883 1.79675 11.9998 1.79675C13.4111 1.79675 14.7375 2.06425 15.979 2.59925C17.2205 3.13425 18.3004 3.86042 19.2188 4.77775C20.1371 5.69492 20.8641 6.7735 21.3998 8.0135C21.9354 9.25334 22.2033 10.5782 22.2033 11.988C22.2033 13.4003 21.9358 14.7275 21.4008 15.9695C20.8658 17.2115 20.1383 18.2925 19.2185 19.2125C18.2985 20.1325 17.2181 20.8609 15.9773 21.3978C14.7363 21.9348 13.4103 22.2033 11.9995 22.2033C10.5887 22.2033 9.26292 21.9348 8.02225 21.3978ZM12 19.9283C12.8682 19.9283 13.7069 19.7924 14.5163 19.5208C15.3258 19.2489 16.0685 18.848 16.7445 18.318L5.67 7.2495C5.148 7.9335 4.75109 8.67825 4.47925 9.48375C4.20759 10.2891 4.07175 11.1238 4.07175 11.988C4.07175 14.2015 4.84075 16.0783 6.37875 17.6183C7.91675 19.1583 9.7905 19.9283 12 19.9283ZM18.3358 16.7268C18.8539 16.0426 19.2489 15.2978 19.5208 14.4925C19.7924 13.687 19.9283 12.8522 19.9283 11.988C19.9283 9.778 19.1593 7.90617 17.6213 6.3725C16.0833 4.83867 14.2095 4.07175 12 4.07175C11.1358 4.07175 10.3021 4.20559 9.49875 4.47325C8.69525 4.74109 7.9515 5.13409 7.2675 5.65225L18.3358 16.7268Z"/>
            </svg>
          </button>

          <button className="btn btn_icon btn_danger" onClick={onLeave} data-tooltip="Turn off">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22.2033C10.5848 22.2033 9.257 21.9356 8.0165 21.4003C6.77584 20.8649 5.69667 20.1385 4.779 19.221C3.8615 18.3033 3.13509 17.2242 2.59975 15.9835C2.06442 14.743 1.79675 13.4152 1.79675 12C1.79675 10.5708 2.06325 9.23942 2.59625 8.00575C3.12925 6.77225 3.85567 5.6955 4.7755 4.7755L6.37875 6.37275C5.65342 7.09809 5.08759 7.9405 4.68125 8.9C4.27492 9.85934 4.07175 10.8931 4.07175 12.0013C4.07175 14.2178 4.83875 16.0931 6.37275 17.6273C7.90692 19.1613 9.78267 19.9283 12 19.9283C14.2173 19.9283 16.0931 19.1613 17.6273 17.6273C19.1613 16.0931 19.9283 14.2178 19.9283 12.0013C19.9283 10.8931 19.7261 9.85934 19.3218 8.9C18.9174 7.9405 18.3526 7.09809 17.6273 6.37275L19.2245 4.7755C20.1443 5.6955 20.8708 6.77225 21.4038 8.00575C21.9368 9.23942 22.2033 10.5708 22.2033 12C22.2033 13.4152 21.9356 14.743 21.4003 15.9835C20.8649 17.2242 20.1385 18.3033 19.221 19.221C18.3033 20.1385 17.2242 20.8649 15.9835 21.4003C14.743 21.9356 13.4152 22.2033 12 22.2033ZM10.8625 13.1375V1.79675H13.1375V13.1375H10.8625Z"/>
            </svg>
          </button>
        </div>
      </div>

      <div className={`filter${filterOpen ? ' show' : ''}`}>
        <div className="field_group i_am">
          <span>I am</span>
          <div className="radio-group">
            <label className="radio-option">
              <input type="radio" name="iAm" value="male" checked={iAm === 'male'} onChange={() => onIAmChange('male')} />
              <div className="btn btn_default">
                <svg className="svg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 22V15H8V9C8 8.45 8.19583 7.97917 8.5875 7.5875C8.97917 7.19583 9.45 7 10 7H14C14.55 7 15.0208 7.19583 15.4125 7.5875C15.8042 7.97917 16 8.45 16 9V15H14V22H10ZM12 6C11.45 6 10.9792 5.80417 10.5875 5.4125C10.1958 5.02083 10 4.55 10 4C10 3.45 10.1958 2.97917 10.5875 2.5875C10.9792 2.19583 11.45 2 12 2C12.55 2 13.0208 2.19583 13.4125 2.5875C13.8042 2.97917 14 3.45 14 4C14 4.55 13.8042 5.02083 13.4125 5.4125C13.0208 5.80417 12.55 6 12 6Z"/>
                </svg>
              </div>
            </label>
            <label className="radio-option">
              <input type="radio" name="iAm" value="female" checked={iAm === 'female'} onChange={() => onIAmChange('female')} />
              <div className="btn btn_default">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 22V16H7L10.05 8.3C10.2167 7.9 10.475 7.58333 10.825 7.35C11.175 7.11667 11.5667 7 12 7C12.4333 7 12.825 7.11667 13.175 7.35C13.525 7.58333 13.7833 7.9 13.95 8.3L17 16H14V22H10ZM10.5875 5.4125C10.1958 5.02083 10 4.55 10 4C10 3.45 10.1958 2.97917 10.5875 2.5875C10.9792 2.19583 11.45 2 12 2C12.55 2 13.0208 2.19583 13.4125 2.5875C13.8042 2.97917 14 3.45 14 4C14 4.55 13.8042 5.02083 13.4125 5.4125C13.0208 5.80417 12.55 6 12 6C11.45 6 10.9792 5.80417 10.5875 5.4125Z"/>
                </svg>
              </div>
            </label>
            <label className="radio-option">
              <input type="radio" name="iAm" value="any" checked={iAm === 'any'} onChange={() => onIAmChange('any')} />
              <div className="btn btn_default">Any</div>
            </label>
          </div>
        </div>

        <div className="field_group">
          <span>Looking for</span>
          <div className="radio-group">
            <label className="radio-option">
              <input type="radio" name="lookingfor" value="male" checked={lookingFor === 'male'} onChange={() => onLookingForChange('male')} />
              <div className="btn btn_default">
                <svg className="svg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 22V15H8V9C8 8.45 8.19583 7.97917 8.5875 7.5875C8.97917 7.19583 9.45 7 10 7H14C14.55 7 15.0208 7.19583 15.4125 7.5875C15.8042 7.97917 16 8.45 16 9V15H14V22H10ZM12 6C11.45 6 10.9792 5.80417 10.5875 5.4125C10.1958 5.02083 10 4.55 10 4C10 3.45 10.1958 2.97917 10.5875 2.5875C10.9792 2.19583 11.45 2 12 2C12.55 2 13.0208 2.19583 13.4125 2.5875C13.8042 2.97917 14 3.45 14 4C14 4.55 13.8042 5.02083 13.4125 5.4125C13.0208 5.80417 12.55 6 12 6Z"/>
                </svg>
              </div>
            </label>
            <label className="radio-option">
              <input type="radio" name="lookingfor" value="female" checked={lookingFor === 'female'} onChange={() => onLookingForChange('female')} />
              <div className="btn btn_default">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 22V16H7L10.05 8.3C10.2167 7.9 10.475 7.58333 10.825 7.35C11.175 7.11667 11.5667 7 12 7C12.4333 7 12.825 7.11667 13.175 7.35C13.525 7.58333 13.7833 7.9 13.95 8.3L17 16H14V22H10ZM10.5875 5.4125C10.1958 5.02083 10 4.55 10 4C10 3.45 10.1958 2.97917 10.5875 2.5875C10.9792 2.19583 11.45 2 12 2C12.55 2 13.0208 2.19583 13.4125 2.5875C13.8042 2.97917 14 3.45 14 4C14 4.55 13.8042 5.02083 13.4125 5.4125C13.0208 5.80417 12.55 6 12 6C11.45 6 10.9792 5.80417 10.5875 5.4125Z"/>
                </svg>
              </div>
            </label>
            <label className="radio-option">
              <input type="radio" name="lookingfor" value="any" checked={lookingFor === 'any'} onChange={() => onLookingForChange('any')} />
              <div className="btn btn_default">Any</div>
            </label>
          </div>
        </div>
      </div>

    </div>
  )
}
