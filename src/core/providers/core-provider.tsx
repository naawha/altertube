import { MantineProvider } from "@mantine/core"
import type { ReactNode } from "react"

type CoreProviderProps = {
  children: ReactNode
}

export function CoreProvider({ children }: CoreProviderProps) {
  return (
    <MantineProvider defaultColorScheme="auto">{children}</MantineProvider>
  )
}
