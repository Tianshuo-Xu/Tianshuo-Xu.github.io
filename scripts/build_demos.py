"""Build homepage videos from the official project assets (requires FFmpeg).

python3 scripts/build_demos.py --cache /path/to/cache [--proxy http://host:port]
All examples retain their full duration and original playback speed.
"""
import argparse
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "demos"
REMIND = "https://remind-applied.github.io/assets/videos/state/"
MOTION = "https://github.com/Tianshuo-Xu/Motion-Forcing/releases/download/v0.1-assets/"
FONT = Path("/System/Library/Fonts/Supplemental/Arial.ttf")


def run(args):
    subprocess.run(args, check=True)


def duration(path):
    return float(subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", str(path)
    ]))


def text(label, x, y, size=20):
    font = f"fontfile='{FONT}':" if FONT.exists() else "font='sans-serif':"
    return f"drawtext={font}text='{label}':x={x}:y={y}:fontsize={size}:fontcolor=white"


def encode(inputs, graph, target, seconds):
    run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *inputs,
         "-filter_complex", graph, "-map", "[out]", "-t", str(seconds), "-an",
         "-c:v", "libx264", "-preset", "medium", "-crf", "23",
         "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(target)])
    run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-ss", "0.3",
         "-i", str(target), "-frames:v", "1", "-q:v", "3", str(target.with_suffix(".jpg"))])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cache", type=Path, default=ROOT / ".media-cache")
    parser.add_argument("--proxy")
    args = parser.parse_args()
    args.cache.mkdir(parents=True, exist_ok=True)
    OUTPUT.mkdir(parents=True, exist_ok=True)
    sources = []

    def fetch(filename, url):
        target = args.cache / filename
        if not target.exists():
            proxy = ["--proxy", args.proxy] if args.proxy else []
            partial = target.with_suffix(target.suffix + ".part")
            run(["curl", *proxy, "--fail", "-L", "--retry", "2", "--max-time", "120",
                 "-sS", url, "-o", str(partial)])
            partial.replace(target)
        sources.append({"file": filename, "url": url})
        return target

    chapters = [
        ("Camera motion", "camera-pan", [1, 2, 3, 4],
         ["Water flow", "Grating", "Dog motion", "Squeezing a lemon"]),
        ("Occlusion and light changes", "occlusion", [1, 2, 4, 12],
         ["Coffee pouring", "Mixing batter", "Batter spreading", "Light off and on"])
    ]
    chapter_files = []
    chapter_seconds = []
    for chapter_index, (heading, group, cases, labels) in enumerate(chapters):
        clips = [fetch(f"{group}-{n:02d}.mp4", f"{REMIND}{group}/{n:02d}.mp4?v=ba80d41") for n in cases]
        seconds = max(duration(p) for p in clips)
        inputs = sum((["-i", str(p)] for p in clips), [])
        filters = []
        for i, label in enumerate(labels):
            filters.append(
                f"[{i}:v]fps=16,setpts=PTS-STARTPTS,scale=624:360,setsar=1,"
                f"tpad=stop_mode=clone:stop_duration=1,trim=duration={seconds},"
                f"drawbox=x=0:y=326:w=iw:h=34:color=black@0.5:t=fill,"
                f"{text(label, 12, 333, 18)}[v{i}]"
            )
        filters.append("[v0][v1][v2][v3]xstack=inputs=4:layout=0_0|632_0|0_368|632_368:fill=0x17251f[grid]")
        filters.append(f"[grid]pad=1280:800:12:60:color=0x17251f,{text(f'0{chapter_index+1} / {heading}', 18, 18, 26)}[out]")
        chapter_file = args.cache / f"remind-chapter-{chapter_index+1}.mp4"
        encode(inputs, ";".join(filters), chapter_file, seconds)
        chapter_files.append(chapter_file)
        chapter_seconds.append(seconds)
    concat = args.cache / "remind-concat.txt"
    concat.write_text("".join(f"file '{p.resolve()}'\n" for p in chapter_files))
    reel = OUTPUT / "remind-overview.mp4"
    run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-f", "concat",
         "-safe", "0", "-i", str(concat), "-c", "copy", "-movflags", "+faststart", str(reel)])
    run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-ss", "0.3", "-i", str(reel),
         "-frames:v", "1", "-q:v", "3", str(reel.with_suffix(".jpg"))])

    motion_sets = {
        "driving": [("driving-left", "more_driving_scene1--ours-left-cut-in-and-brake", "webp", "Left cut-in + brake"),
                    ("driving-right", "more_driving_scene1--ours-right-cut-in", "webp", "Right cut-in")],
        "ego": [("ego-left", "driving_ego_action--ours-left", "png", "Turn left"),
                ("ego-right", "driving_ego_action--ours-right", "png", "Turn right")],
        "robot": [("robot-one", "embodied_ai--case1--action1", "png", "Action 1"),
                  ("robot-two", "embodied_ai--case1--action2", "png", "Action 2")]
    }
    for category, cases in motion_sets.items():
        inputs, clips, labels = [], [], []
        for label, basename, ext, caption in cases:
            condition = fetch(f"{label}-condition.{ext}", MOTION + basename + "." + ext)
            clip = fetch(label + ".mp4", MOTION + basename + ".mp4")
            inputs += ["-loop", "1", "-framerate", "16", "-i", str(condition), "-i", str(clip)]
            clips.append(clip)
            labels.append(caption)
        seconds = max(duration(p) for p in clips)
        filters = []
        for i in range(2):
            filters.append(f"[{i*2}:v]scale=464:250:force_original_aspect_ratio=decrease,"
                           "pad=464:250:(ow-iw)/2:(oh-ih)/2:color=0x17251f,setsar=1[c" + str(i) + "]")
            filters.append(f"[{i*2+1}:v]fps=16,setpts=PTS-STARTPTS,"
                           "scale=464:310:force_original_aspect_ratio=decrease,"
                           "pad=464:310:(ow-iw)/2:(oh-ih)/2:color=0x17251f,setsar=1,"
                           f"tpad=stop_mode=clone:stop_duration=1,trim=duration={seconds}[v{i}]")
        filters.append("[c0][c1]xstack=inputs=2:layout=0_0|480_0:fill=0x17251f,pad=960:360:8:90:color=0x17251f,"
                       + text(labels[0], 16, 18, 22) + "," + text(labels[1], 496, 18, 22) + ","
                       + text("CONTROL INPUT", 16, 62, 14) + "," + text("CONTROL INPUT", 496, 62, 14) + "[conditions]")
        filters.append("[v0][v1]xstack=inputs=2:layout=0_0|480_0:fill=0x17251f,pad=960:360:8:28:color=0x17251f,"
                       + text("GENERATED VIDEO", 16, 4, 14) + "," + text("GENERATED VIDEO", 496, 4, 14) + "[results]")
        filters.append("[conditions][results]vstack=inputs=2[out]")
        encode(inputs, ";".join(filters), OUTPUT / f"motion-{category}.mp4", seconds)
    manifest = {"remind_chapter_start": chapter_seconds[0], "remind_duration": sum(chapter_seconds),
                "editing": "Complete sequences, original speed; synchronized control/result pairs.", "sources": sources}
    (OUTPUT / "sources.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print(json.dumps({"remind_duration": sum(chapter_seconds), "files": sorted(p.name for p in OUTPUT.iterdir())}))


if __name__ == "__main__":
    main()
