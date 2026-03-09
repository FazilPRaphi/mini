import { useRef, useState, useEffect } from "react";

const AudioMessage = ({ src, isMine }) => {

    const audioRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
            setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
        };

        const onLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        const onEnded = () => {
            setPlaying(false);
            setProgress(0);
            setCurrentTime(0);
            audio.currentTime = 0;
        };

        audio.addEventListener("timeupdate", onTimeUpdate);
        audio.addEventListener("loadedmetadata", onLoadedMetadata);
        audio.addEventListener("ended", onEnded);

        return () => {
            audio.removeEventListener("timeupdate", onTimeUpdate);
            audio.removeEventListener("loadedmetadata", onLoadedMetadata);
            audio.removeEventListener("ended", onEnded);
        };
    }, []);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (playing) {
            audio.pause();
        } else {
            audio.play();
        }
        setPlaying(!playing);
    };

    const handleSeek = (e) => {
        const audio = audioRef.current;
        if (!audio || !audio.duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const ratio = x / rect.width;
        audio.currentTime = ratio * audio.duration;
        setProgress(ratio * 100);
    };

    const formatTime = (secs) => {
        if (!secs || isNaN(secs)) return "0:00";
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    // Generate fake waveform bars (30 bars)
    const bars = Array.from({ length: 30 }, (_, i) => {
        const heights = [3, 5, 8, 12, 9, 15, 10, 6, 14, 8, 5, 12, 9, 16, 7, 11, 5, 14, 8, 10, 6, 13, 9, 7, 11, 4, 12, 8, 14, 6];
        return heights[i % heights.length];
    });

    const filledBars = Math.round((progress / 100) * bars.length);

    return (
        <div className="flex items-center gap-3 min-w-[220px] max-w-[280px]">
            <audio ref={audioRef} src={src} preload="metadata" />

            {/* Play / Pause Button */}
            <button
                onClick={togglePlay}
                className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center transition-all shadow-sm ${isMine
                        ? "bg-white/30 hover:bg-white/50 text-white"
                        : "bg-cyan-500 hover:bg-cyan-600 text-white"
                    }`}
            >
                {playing ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                )}
            </button>

            {/* Waveform + Time */}
            <div className="flex flex-col gap-1 flex-1">
                {/* Waveform bars */}
                <div
                    className="flex items-center gap-[2px] w-full h-8 cursor-pointer"
                    onClick={handleSeek}
                >
                    {bars.map((height, i) => (
                        <div
                            key={i}
                            style={{ height: `${height}px`, minWidth: "3px" }}
                            className={`rounded-full flex-1 transition-colors ${i < filledBars
                                    ? isMine
                                        ? "bg-white"
                                        : "bg-cyan-500"
                                    : isMine
                                        ? "bg-white/40"
                                        : "bg-gray-300"
                                }`}
                        />
                    ))}
                </div>

                {/* Duration */}
                <p className={`text-[11px] font-medium ${isMine ? "text-cyan-100" : "text-gray-400"}`}>
                    {formatTime(playing ? currentTime : duration)}
                </p>
            </div>
        </div>
    );
};

export default AudioMessage;
