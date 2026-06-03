import { Select } from "@mantine/core"
import type { PlaybackQualityOption } from "@/models/video/lib/pickPlayback"
import type { FC } from "react"

interface PlaybackQualitySelectProps {
  options: PlaybackQualityOption[]
  activeUrl: string
  onChange: (url: string) => void
}

const PlaybackQualitySelect: FC<PlaybackQualitySelectProps> = ({ options, activeUrl, onChange }) => {
  if (options.length <= 1) return null

  return (
    <Select
      size="xs"
      allowDeselect={false}
      comboboxProps={{ withinPortal: true, zIndex: 10002 }}
      data={options.map((o) => ({ value: o.url, label: o.label }))}
      value={activeUrl}
      onChange={(v) => v && onChange(v)}
      style={{
        position: "absolute",
        top: 8,
        right: 8,
        zIndex: 10001,
        minWidth: 100,
        maxWidth: 140,
      }}
    />
  )
}

export default PlaybackQualitySelect