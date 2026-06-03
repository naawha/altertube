import { Divider, Paper, Box, Text, UnstyledButton } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { IconChevronUp, IconChevronDown } from "@tabler/icons-react"
import { FC } from "react"

interface DescriptionSectionProps {
    description: string
}

const DescriptionSection: FC<DescriptionSectionProps> = ({ description }) => {
    const [descOpen, { toggle: toggleDesc }] = useDisclosure(false)
    return (
        <>
            <Divider my="xs" />
            <Paper p="md" radius="lg" withBorder shadow="none" bg="var(--mantine-color-body)">
                <Box
                    component="div"
                    style={{
                        maxHeight: descOpen ? "none" : 4.5 * 16,
                        overflow: descOpen ? "visible" : "hidden",
                    }}
                >
                    <Text
                        component="div"
                        size="sm"
                        style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                        dangerouslySetInnerHTML={{ __html: description }}
                    />
                </Box>
                <UnstyledButton
                    type="button"
                    onClick={toggleDesc}
                    mt="xs"
                    fz="sm"
                    fw={600}
                    c="dimmed"
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                >
                    {descOpen ? (
                        <>
                            Свернуть <IconChevronUp size={16} />
                        </>
                    ) : (
                        <>
                            Ещё <IconChevronDown size={16} />
                        </>
                    )}
                </UnstyledButton>
            </Paper>
        </>
    )
}

export default DescriptionSection