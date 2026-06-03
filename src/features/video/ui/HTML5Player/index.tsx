import { useEffect, useRef, useState, type FC } from "react"
import type { PlaybackQualityOption } from "@/models/video/lib/pickPlayback"
import PlaybackQualitySelect from "./ui/PlaybackQualitySelect"

interface HTML5PlayerProps {
    videoUrl: string
    audioUrl: string
    qualities?: PlaybackQualityOption[]
}

const HTML5Player: FC<HTML5PlayerProps> = ({ videoUrl, audioUrl, qualities }) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const audioRef = useRef<HTMLAudioElement>(null)
    const [activeVideoUrl, setActiveVideoUrl] = useState(videoUrl)
    const resumeAfterLoadRef = useRef<{ t: number; play: boolean } | null>(null)

    useEffect(() => {
        const v = videoRef.current
        const a = audioRef.current
        if (!v || !a) return

        v.muted = true

        const onPlay = () => {
            void a.play().catch(() => { })
        }
        const onPause = () => {
            a.pause()
        }
        const onSeek = () => {
            a.currentTime = v.currentTime
        }
        const onVolume = () => {
            a.volume = v.volume
        }
        const onRate = () => {
            a.playbackRate = v.playbackRate
        }

        const sync = () => {
            if (Math.abs(a.currentTime - v.currentTime) > 0.35) {
                a.currentTime = v.currentTime
            }
        }

        v.addEventListener("play", onPlay)
        v.addEventListener("pause", onPause)
        v.addEventListener("seeked", onSeek)
        v.addEventListener("volumechange", onVolume)
        v.addEventListener("ratechange", onRate)
        const interval = window.setInterval(sync, 400)

        a.volume = v.volume

        return () => {
            window.clearInterval(interval)
            v.removeEventListener("play", onPlay)
            v.removeEventListener("pause", onPause)
            v.removeEventListener("seeked", onSeek)
            v.removeEventListener("volumechange", onVolume)
            v.removeEventListener("ratechange", onRate)
        }
    }, [activeVideoUrl, audioUrl])

    useEffect(() => {
        const v = videoRef.current
        const a = audioRef.current
        const pending = resumeAfterLoadRef.current
        if (!v || !a || !pending) return

        const onMeta = () => {
            resumeAfterLoadRef.current = null
            v.currentTime = pending.t
            a.currentTime = pending.t
            if (pending.play) {
                void v.play().catch(() => { })
                void a.play().catch(() => { })
            }
            v.removeEventListener("loadedmetadata", onMeta)
        }
        v.addEventListener("loadedmetadata", onMeta)
        return () => {
            v.removeEventListener("loadedmetadata", onMeta)
        }
    }, [activeVideoUrl])

    const onQualityChange = (url: string) => {
        const v = videoRef.current
        if (!v) {
            setActiveVideoUrl(url)
            return
        }
        resumeAfterLoadRef.current = { t: v.currentTime, play: !v.paused }
        setActiveVideoUrl(url)
    }

    return (
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
            {qualities ? (
                <PlaybackQualitySelect
                    options={qualities}
                    activeUrl={activeVideoUrl}
                    onChange={onQualityChange}
                />
            ) : null}
            <video
                ref={videoRef}
                src={activeVideoUrl}
                controls
                playsInline
                style={{
                    width: "100%",
                    height: "100%",
                    display: "block",
                    objectFit: "contain",
                }}
            />
            <audio ref={audioRef} src={audioUrl} hidden />
        </div>
    )
}

export default HTML5Player