import {
  Anchor,
  Button,
  Group,
  Modal,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core"
import { useState, type SubmitEvent } from "react"
import { getAuthErrorMessage } from "@/features/auth/lib/getAuthErrorMessage"
import { useRegisterMutation } from "@/models/profile"

interface RegisterModalProps {
  opened: boolean
  onClose: () => void
  onLoginClick?: () => void
}

const RegisterModal = ({ opened, onClose, onLoginClick }: RegisterModalProps) => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [validationError, setValidationError] = useState<string | null>(null)
  const [register, { isLoading, isError, error, reset }] = useRegisterMutation()

  const handleClose = () => {
    reset()
    setValidationError(null)
    onClose()
  }

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault()
    reset()
    setValidationError(null)

    if (password !== passwordConfirm) {
      setValidationError("Пароли не совпадают")
      return
    }

    if (password.length > 55) {
      setValidationError("Пароль не длиннее 55 символов")
      return
    }

    try {
      await register({ username, password }).unwrap()
      handleClose()
      setUsername("")
      setPassword("")
      setPasswordConfirm("")
    } catch {
      /* ошибка отображается через isError */
    }
  }

  const displayError =
    validationError ??
    (isError ? getAuthErrorMessage(error, "Не удалось зарегистрироваться.") : null)

  return (
    <Modal opened={opened} onClose={handleClose} title="Регистрация" centered>
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Логин"
            placeholder="username"
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
            autoComplete="new-password"
            required
          />
          <PasswordInput
            label="Повторите пароль"
            placeholder="••••••••"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.currentTarget.value)}
            autoComplete="new-password"
            required
          />
          {displayError ? (
            <Text size="sm" c="red">
              {displayError}
            </Text>
          ) : null}
          {onLoginClick ? (
            <Text size="sm" c="dimmed">
              Уже есть аккаунт?{" "}
              <Anchor
                component="button"
                type="button"
                onClick={() => {
                  handleClose()
                  onLoginClick()
                }}
              >
                Войти
              </Anchor>
            </Text>
          ) : null}
          <Group justify="flex-end" gap="sm">
            <Button type="button" variant="default" onClick={handleClose}>
              Отмена
            </Button>
            <Button type="submit" loading={isLoading}>
              Зарегистрироваться
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}

export default RegisterModal
