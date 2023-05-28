"use client"

import * as React from "react"

import { Input, type InputProps } from "@/components/ui/input"

interface DebounceInputProps extends InputProps {
  debounce?: number
}

export function DebounceInput({
  onChange,
  debounce = 500,
  ...props
}: DebounceInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [value, setValue] = React.useState(props.value ?? "")
  const [debouncedValue, setDebouncedValue] = React.useState(value)

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value)
    },
    []
  )

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      inputRef.current?.focus()
      setDebouncedValue(value)
    }, debounce)

    return () => {
      clearTimeout(timeout)
    }
  }, [value, debounce])

  React.useEffect(() => {
    if (debouncedValue !== props.value) {
      // @ts-expect-error debouncedValue is not React.ChangeEvent<HTMLInputElement>
      onChange?.(debouncedValue)
    }
  }, [debouncedValue, onChange, props.value])

  return (
    <Input ref={inputRef} {...props} value={value} onChange={handleChange} />
  )
}
