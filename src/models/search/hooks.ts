import { useSearchQuery } from "./api/searchSlice"

const useSearch = (q: string) => {
  const { data, isLoading, isError } = useSearchQuery({ q })
  return { data, isLoading, isError }
}

export default useSearch
