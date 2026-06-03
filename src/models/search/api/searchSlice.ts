import { invidiousApi } from "@/shared/api/invidiousAPI"
import { PipedSearchRequestType, PipedSearchResponseType } from "../types"
import { normalizeSearchSuggestions } from "../helpers"

export const searchSlice = invidiousApi.injectEndpoints({
  endpoints: (builder) => ({
    search: builder.query<PipedSearchResponseType, PipedSearchRequestType>({
      query: ({ q }) => ({
        url: "/v1/search",
        params: { q },
      }),
    }),
    getSearchNextPage: builder.query<
      PipedSearchResponseType,
      PipedSearchRequestType & { nextPageData: string }
    >({
      query: ({ q, filter = "all", nextPageData }) => ({
        url: "/v1/nextpage/search",
        params: { q, filter, nextpage: nextPageData },
      }),
    }),
    getSearchSuggestions: builder.query<string[], string>({
      query: (query) => ({
        url: "/v1/opensearch/suggestions",
        params: { query },
      }),
      transformResponse: (raw: unknown) => normalizeSearchSuggestions(raw),
    }),
  }),
  overrideExisting: true
})

export const {
  useSearchQuery,
  useLazySearchQuery,
  useLazyGetSearchNextPageQuery,
  useGetSearchSuggestionsQuery,
} = searchSlice
