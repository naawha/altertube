import { Box, Text, Tooltip } from "@mantine/core"
import { FC } from "react"
import { formatUploadedAbsolute, formatUploadedRelative } from "./helpers"

interface DateDisplayProps {
  timestamp: number
}

const DateDisplay: FC<DateDisplayProps> = ({ timestamp }) => {
  const tooltipLabel =
    timestamp != null && Number.isFinite(timestamp)
      ? formatUploadedAbsolute(timestamp)
      : ""

  return (
    <Tooltip label={tooltipLabel} disabled={!tooltipLabel} withArrow openDelay={200}>
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Text
          fz="sm"
          component="span"
          size="xs"
          c="dimmed"
          lineClamp={1}
          style={{
            cursor: tooltipLabel ? "help" : undefined,
          }}
        >
          {formatUploadedRelative(timestamp)}
        </Text>
      </Box>
    </Tooltip>
  )
}

export default DateDisplay
