import { Container, Text, Title } from "@mantine/core"
import { useRouter } from "next/router"
import type { FC } from "react"
import { useSearchQuery } from "@/models/search"
import SearchResultsGrid from "./ui/SearchResultsGrid"

const SearchView: FC = () => {
    const router = useRouter()
    const qRaw = router.query.q
    const q =
        typeof qRaw === "string" ? qRaw : Array.isArray(qRaw) ? (qRaw[0] ?? "") : ""

    const { data, isLoading, isError, error } = useSearchQuery(
        { q },
        { skip: !router.isReady || !q.trim() }
    )

    if (!router.isReady) {
        return (
            <Container py="xl" size="xl">
                <Text c="dimmed">Загрузка…</Text>
            </Container>
        )
    }

    if (!q.trim()) {
        return (
            <Container py="xl" size="xl">
                <Text c="dimmed">Введите запрос в поле поиска в шапке.</Text>
            </Container>
        )
    }

    return (
        <Container py="xl" size="xl">
            <Title order={2} mb="lg" style={{ wordBreak: "break-word" }}>
                Результаты по запросу «{q}»
            </Title>

            {isLoading ? <Text c="dimmed">Поиск…</Text> : null}

            {isError ? (
                <Text size="sm" c="red">
                    {error && typeof error === "object" && "data" in error && error.data != null
                        ? JSON.stringify(error.data)
                        : "Не удалось выполнить поиск."}
                </Text>
            ) : null}

            {data && data.items.length === 0 && !isLoading ? (
                <Text c="dimmed">Ничего не найдено.</Text>
            ) : null}

            {data && data.items.length > 0 ? (
                <SearchResultsGrid
                    key={q}
                    q={q}
                    initialItems={data.items}
                    initialNextPage={data.nextpage ?? null}
                />
            ) : null}
        </Container>
    )
}


export default SearchView
