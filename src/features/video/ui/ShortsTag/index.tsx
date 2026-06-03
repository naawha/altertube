import { Badge } from "@mantine/core"
import { FC } from "react"

const ShortsTag: FC = () => {
  return (
    <Badge
      size="xs"
      variant="filled"
      color="dark"
      radius="sm"
      pos="absolute"
      left={8}
      bottom={8}
      style={{ zIndex: 1, pointerEvents: "none" }}
    >
      SHORTS
    </Badge>
  )
}

export default ShortsTag
