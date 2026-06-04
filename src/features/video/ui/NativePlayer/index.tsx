import { useEffect, useState, type FC } from "react"
import type { PlaybackQualityOption } from "@/models/video/lib/pickPlayback"
import PlaybackQualitySelect from "../HTML5Player/ui/PlaybackQualitySelect"

interface NativePlayerProps {
  src: string
  qualities?: PlaybackQualityOption[]
}

const NativePlayer: FC<NativePlayerProps> = ({ src, qualities }) => {
  const [activeUrl, setActiveUrl] = useState(src)

  useEffect(() => {
    setActiveUrl(src)
  }, [src])

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {qualities ? (
        <PlaybackQualitySelect
          options={qualities}
          activeUrl={activeUrl}
          onChange={setActiveUrl}
        />
      ) : null}
      <video
        key={activeUrl}
        src={activeUrl}
        controls
        playsInline
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          objectFit: "contain",
        }}
      />
    </div>
  )
}

export default NativePlayer
