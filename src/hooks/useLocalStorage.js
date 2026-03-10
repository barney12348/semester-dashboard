import { useState } from 'react'

const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setStoredValue = newValue => {
    const val = typeof newValue === 'function' ? newValue(value) : newValue
    setValue(val)
    window.localStorage.setItem(key, JSON.stringify(val))
  }

  return [value, setStoredValue]
}

export default useLocalStorage
