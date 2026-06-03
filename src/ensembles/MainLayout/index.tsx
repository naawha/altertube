import { Anchor, AppShell, Box, Button, Group, Loader, ThemeIcon } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { IconPlayerPlayFilled } from "@tabler/icons-react"
import Link from "next/link"
import type { FC, ReactNode } from "react"
import { HeaderSearch } from "./ui/HeaderSearch"
import { useUserState } from "@/models/profile"
import { useLogout, AuthModal, RegisterModal } from "@/features/auth"
import dynamic from "next/dynamic"

const ColorSchemeToggle = dynamic(() => import("./ui/ColorSchemeToggle"), {
  ssr: false,
})

interface MainLayoutProps {
  children: ReactNode
}

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  const { isAuthenticated, authPending } = useUserState()
  const [authOpened, { open: openAuth, close: closeAuth }] = useDisclosure(false)
  const [registerOpened, { open: openRegister, close: closeRegister }] =
    useDisclosure(false)

  const logout = useLogout()

  return (
    <AppShell header={{ height: 56 }}>
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap" gap="md">
          <Group gap="md" wrap="nowrap" style={{ flexShrink: 0 }}>
            <Anchor
              component={Link}
              href="/"
              c="inherit"
              underline="never"
              aria-label="Piped Video — на главную"
            >
              <ThemeIcon size="lg" radius="md" variant="filled" color="purple">
                <IconPlayerPlayFilled size={22} stroke={1.5} />
              </ThemeIcon>
            </Anchor>
            <Anchor
              component={Link}
              href="/subscriptions"
              c="dimmed"
              size="sm"
              underline="hover"
            >
              Подписки
            </Anchor>
            <Anchor
              component={Link}
              href="/playlists"
              c="dimmed"
              size="sm"
              underline="hover"
            >
              Плейлисты
            </Anchor>
          </Group>

          <Box
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              minWidth: 0,
            }}
          >
            <HeaderSearch />
          </Box>

          <Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
            <ColorSchemeToggle />
            {authPending ? (
              <Loader size="sm" type="dots" />
            ) : isAuthenticated ? (
              <Button variant="default" onClick={logout}>
                Выйти
              </Button>
            ) : (
              <Button variant="default" onClick={openAuth}>
                Авторизация
              </Button>
            )}
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Main>{children}</AppShell.Main>
      <AuthModal
        opened={authOpened}
        onClose={closeAuth}
        onRegisterClick={openRegister}
      />
      <RegisterModal
        opened={registerOpened}
        onClose={closeRegister}
        onLoginClick={openAuth}
      />
    </AppShell>
  )
}

export default MainLayout
