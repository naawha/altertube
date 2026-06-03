import { Modal } from "@mantine/core"
import { Stack } from "@mantine/core"
import { TextInput } from "@mantine/core"
import { PasswordInput } from "@mantine/core"
import { Button } from "@mantine/core"
import { Group } from "@mantine/core"
import { Text } from "@mantine/core"
import { useState, type SubmitEvent } from "react"
import { useLoginMutation } from "@/models/profile"


function getErrorMessage(err: unknown): string {
    if (
        typeof err === "object" &&
        err !== null &&
        "data" in err &&
        typeof (err as { data: unknown }).data === "object" &&
        (err as { data: { error?: string } }).data &&
        typeof (err as { data: { error?: string } }).data.error === "string"
    ) {
        return (err as { data: { error: string } }).data.error
    }
    if (err instanceof Error) {
        return err.message
    }
    return "Не удалось войти. Проверьте данные и попробуйте снова."
}

interface AuthModalProps {
    opened: boolean
    onClose: () => void
}

const AuthModal = ({ opened, onClose }: AuthModalProps) => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [login, { isLoading, isError, error, reset }] = useLoginMutation()

    const handleClose = () => {
        onClose()
    }

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault()
        reset()
        try {
            await login({ username, password }).unwrap()
            onClose()
            setUsername("")
            setPassword("")
        } catch {
            /* ошибка отображается через isError */
        }
    }

    return (

        <Modal opened={opened} onClose={handleClose} title="Вход" centered>
            <form onSubmit={handleSubmit}>
                <Stack gap="md">
                    <TextInput
                        label="Логин"
                        placeholder="user@example.com"
                        value={username}
                        onChange={(e) => setUsername(e.currentTarget.value)}
                        autoComplete="username"
                        required
                    />
                    <PasswordInput
                        label="Пароль"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.currentTarget.value)}
                        autoComplete="current-password"
                        required
                    />
                    {isError ? (
                        <Text size="sm" c="red">
                            {getErrorMessage(error)}
                        </Text>
                    ) : null}
                    <Group justify="flex-end" gap="sm">
                        <Button type="button" variant="default" onClick={handleClose}>
                            Отмена
                        </Button>
                        <Button type="submit" loading={isLoading}>
                            Войти
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    )
}

export default AuthModal