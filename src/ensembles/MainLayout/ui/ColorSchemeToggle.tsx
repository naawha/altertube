import { ActionIcon, Menu, useMantineColorScheme } from "@mantine/core"
import { IconCheck, IconDeviceDesktop, IconMoon, IconSun } from "@tabler/icons-react"
import type { FC } from "react"

const ColorSchemeToggle: FC = () => {
    const { colorScheme, setColorScheme } = useMantineColorScheme()

    const triggerIcon =
        colorScheme === "light" ? (
            <IconSun size={18} stroke={1.5} />
        ) : colorScheme === "dark" ? (
            <IconMoon size={18} stroke={1.5} />
        ) : (
            <IconDeviceDesktop size={18} stroke={1.5} />
        )

    return (
        <Menu shadow="md" width={220} position="bottom-end">
            <Menu.Target>
                <ActionIcon variant="default" aria-label="Тема оформления" size="lg">
                    {triggerIcon}
                </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Item
                    leftSection={<IconSun size={16} stroke={1.5} />}
                    rightSection={colorScheme === "light" ? <IconCheck size={16} /> : null}
                    onClick={() => setColorScheme("light")}
                >
                    Светлая
                </Menu.Item>
                <Menu.Item
                    leftSection={<IconMoon size={16} stroke={1.5} />}
                    rightSection={colorScheme === "dark" ? <IconCheck size={16} /> : null}
                    onClick={() => setColorScheme("dark")}
                >
                    Тёмная
                </Menu.Item>
                <Menu.Item
                    leftSection={<IconDeviceDesktop size={16} stroke={1.5} />}
                    rightSection={colorScheme === "auto" ? <IconCheck size={16} /> : null}
                    onClick={() => setColorScheme("auto")}
                >
                    Как в системе
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    )
}

export default ColorSchemeToggle