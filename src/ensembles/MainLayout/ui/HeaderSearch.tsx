"use client"

import { Autocomplete } from "@mantine/core"
import { useDebouncedValue } from "@mantine/hooks"
import { IconSearch } from "@tabler/icons-react"
import { useRouter } from "next/router"
import { useState } from "react"
import { useGetSearchSuggestionsQuery } from "@/models/search"

type HeaderSearchFieldProps = {
    initialQuery: string
}

function HeaderSearchField({ initialQuery }: HeaderSearchFieldProps) {
    const router = useRouter()
    const [value, setValue] = useState(initialQuery)
    const [debounced] = useDebouncedValue(value, 280)
    const trimmedDebounced = debounced.trim()
    const { data: suggestions = [] } = useGetSearchSuggestionsQuery(trimmedDebounced, {
        skip: trimmedDebounced.length < 1,
    })

    const goSearch = (q: string) => {
        const t = q.trim()
        if (!t) return
        void router.push(`/search?q=${encodeURIComponent(t)}`)
    }

    return (
        <Autocomplete
            placeholder="Поиск"
            leftSection={<IconSearch size={16} stroke={1.5} />}
            radius="md"
            maw={480}
            w="100%"
            aria-label="Поиск по видео"
            value={value}
            onChange={setValue}
            data={suggestions}
            limit={10}
            onOptionSubmit={(option) => {
                setValue(option)
                goSearch(option)
            }}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    e.preventDefault()
                    goSearch(value)
                }
            }}
        />
    )
}

export function HeaderSearch() {
    const router = useRouter()
    const ready = router.isReady
    const urlQ =
        ready && router.pathname === "/search" && typeof router.query.q === "string"
            ? router.query.q
            : ""

    const remountKey = !ready
        ? "boot"
        : router.pathname === "/search"
          ? `search-${urlQ}`
          : "home"

    const initialQuery = ready && router.pathname === "/search" ? urlQ : ""

    return <HeaderSearchField key={remountKey} initialQuery={initialQuery} />
}
