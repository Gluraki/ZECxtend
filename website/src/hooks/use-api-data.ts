import { useCallback, useEffect, useState, type DependencyList } from "react"
import { toast } from "sonner"
import { errorMessage } from "@/lib/errors"

export function useApiData<T>(load: () => Promise<T>, initial: T, deps: DependencyList) {
  const [data, setData] = useState<T>(initial)
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState(0)

  const reload = useCallback(() => setVersion((value) => value + 1), [])

  useEffect(() => {
    let active = true
    setLoading(true)
    load()
      .then((result) => {
        if (active) setData(result)
      })
      .catch((error) => {
        if (!active) return
        setData(initial)
        toast.error(errorMessage(error))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [...deps, version])

  return { data, loading, reload }
}
