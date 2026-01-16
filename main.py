import os
import sys
import subprocess
import re
import random
import shutil
import typer
from loguru import logger
from typing import Optional

# Configure loguru to remove default handler and add a new one with a specific format if needed
# But default loguru is usually good enough.
# Let's just use the default configuration which prints to stderr.

app = typer.Typer(help="Video Processor for OBS Recordings and Subtitles")


def check_dependencies():
    """Check if ffmpeg is installed."""
    if not shutil.which("ffmpeg"):
        logger.error("FFmpeg is not installed. Please install it first.")
        sys.exit(1)


def parse_time(time_input: str) -> float:
    """Parse time format (HH:MM:SS or seconds) to seconds."""
    if not time_input:
        return 0.0

    # Check if it's HH:MM:SS
    if re.match(r"^\d+:\d+:\d+$", str(time_input)):
        h, m, s = map(int, time_input.split(":"))
        return float(h * 3600 + m * 60 + s)

    # Check if it's just seconds (integer or float string)
    if re.match(r"^\d+(\.\d+)?$", str(time_input)):
        return float(time_input)

    logger.error(f"Invalid time format: {time_input}. Use HH:MM:SS or seconds")
    sys.exit(1)


def get_video_duration(input_file: str) -> float:
    cmd = [
        "ffprobe",
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        input_file,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    try:
        return float(result.stdout.strip())
    except ValueError:
        logger.error(f"Could not determine duration for {input_file}")
        sys.exit(1)


def analyze_audio_volume_func(input_file: str) -> float:
    logger.info(f"Analyzing audio volume for: {input_file}")

    cmd = [
        "ffmpeg",
        "-i",
        input_file,
        "-af",
        "volumedetect",
        "-vn",
        "-sn",
        "-dn",
        "-f",
        "null",
        "/dev/null",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    output = result.stderr  # ffmpeg outputs stats to stderr

    mean_volume_match = re.search(r"mean_volume: ([\-\d\.]+) dB", output)
    max_volume_match = re.search(r"max_volume: ([\-\d\.]+) dB", output)

    mean_volume = 0.0
    if mean_volume_match:
        mean_volume = float(mean_volume_match.group(1))
        logger.info(f"Mean volume: {mean_volume} dB")
    else:
        logger.warning("Could not find mean volume")

    if max_volume_match:
        max_volume = float(max_volume_match.group(1))
        logger.info(f"Max volume: {max_volume} dB")

    return mean_volume


def trim_video_func(input_file: str, output_file: str, start_trim: str, end_trim: str):
    logger.info(f"Trimming video: {input_file}")

    duration = get_video_duration(input_file)
    logger.info(f"Original video duration: {int(duration)} seconds")

    start_seconds = parse_time(start_trim)
    end_seconds_trim = parse_time(end_trim)

    if start_seconds > 0:
        logger.info(f"Trimming {start_seconds} seconds from start")

    if end_seconds_trim > 0:
        logger.info(f"Trimming {end_seconds_trim} seconds from end")

    end_time = duration - end_seconds_trim
    duration_trim = end_time - start_seconds

    if duration_trim <= 0:
        logger.error(
            "Invalid trim parameters. Resulting duration would be negative or zero."
        )
        sys.exit(1)

    logger.info(f"New duration: {duration_trim} seconds")

    cmd = [
        "ffmpeg",
        "-i",
        input_file,
        "-ss",
        str(start_seconds),
        "-t",
        str(duration_trim),
        "-c:v",
        "libx264",
        "-c:a",
        "aac",
        "-y",
        output_file,
        "-loglevel",
        "warning",
    ]
    subprocess.run(cmd, check=True)
    logger.success(f"Video trimmed successfully: {output_file}")


def normalize_audio_func(
    input_file: str, output_file: str, target_volume: float = -16.0
):
    logger.info(f"Normalizing audio to {target_volume} dB")

    current_volume = analyze_audio_volume_func(input_file)
    adjustment = target_volume - current_volume

    logger.info(f"Adjusting volume by {adjustment:.2f} dB")

    cmd = [
        "ffmpeg",
        "-i",
        input_file,
        "-af",
        f"volume={adjustment}dB",
        "-c:v",
        "copy",
        "-y",
        output_file,
        "-loglevel",
        "warning",
    ]
    subprocess.run(cmd, check=True)
    logger.success(f"Audio normalized: {output_file}")


def mix_with_background_music_func(
    video_file: str,
    background_music: str,
    output_file: str,
    music_volume: float = 0.3,
    video_audio_volume: float = 1.0,
):
    logger.info("Mixing video with background music")
    logger.info(f"Background music volume: {music_volume}")
    logger.info(f"Video audio volume: {video_audio_volume}")

    video_duration = get_video_duration(video_file)

    # Loop background music
    temp_music = f"temp_looped_music_{random.randint(1000, 9999)}.mp3"
    cmd_loop = [
        "ffmpeg",
        "-stream_loop",
        "-1",
        "-i",
        background_music,
        "-t",
        str(video_duration),
        "-c",
        "copy",
        "-y",
        temp_music,
        "-loglevel",
        "warning",
    ]
    subprocess.run(cmd_loop, check=True)

    # Mix audio tracks
    filter_complex = (
        f"[0:a]volume={video_audio_volume}[va];"
        f"[1:a]volume={music_volume}[ba];"
        f"[va][ba]amix=inputs=2:duration=first"
    )

    cmd_mix = [
        "ffmpeg",
        "-i",
        video_file,
        "-i",
        temp_music,
        "-filter_complex",
        filter_complex,
        "-c:v",
        "copy",
        "-c:a",
        "aac",
        "-y",
        output_file,
        "-loglevel",
        "warning",
    ]
    subprocess.run(cmd_mix, check=True)

    # Cleanup
    if os.path.exists(temp_music):
        os.remove(temp_music)

    logger.success(f"Audio mixed successfully: {output_file}")


@app.callback()
def callback():
    """
    Video Processor for OBS Recordings and Subtitles
    """
    check_dependencies()


@app.command()
def trim(input_video: str, output_video: str, start_trim: str, end_trim: str):
    """Trim video from start/end."""
    trim_video_func(input_video, output_video, start_trim, end_trim)


@app.command()
def normalize(
    input_video: str,
    output_video: str,
    target_volume: float = typer.Option(-16.0, help="Target volume in dB"),
):
    """Normalize audio to a target volume."""
    normalize_audio_func(input_video, output_video, target_volume)


@app.command()
def analyze(input_video: str):
    """Analyze audio volume."""
    analyze_audio_volume_func(input_video)


@app.command()
def mix(
    input_video: str,
    background_music: str,
    output_video: str,
    music_volume: float = typer.Option(0.3, help="Music volume (0.0-1.0)"),
    video_volume: float = typer.Option(1.0, help="Video audio volume (0.0-1.0)"),
):
    """Mix video with background music."""
    mix_with_background_music_func(
        input_video, background_music, output_video, music_volume, video_volume
    )


@app.command()
def process(
    input_video: str,
    background_music: str,
    output_video: str,
    start_trim: str,
    end_trim: str,
    target_volume: float = typer.Option(-16.0, help="Target volume in dB"),
    music_volume: float = typer.Option(0.3, help="Music volume"),
):
    """Run full processing pipeline."""
    logger.info("Starting full video processing pipeline...")

    temp_trimmed = f"temp_trimmed_{random.randint(1000, 9999)}.mp4"
    temp_normalized = f"temp_normalized_{random.randint(1000, 9999)}.mp4"

    current_input = input_video

    # Step 1: Trim
    if start_trim != "0" or end_trim != "0":
        trim_video_func(current_input, temp_trimmed, start_trim, end_trim)
        current_input = temp_trimmed

    # Step 2: Normalize
    logger.info("Normalizing video audio...")
    normalize_audio_func(current_input, temp_normalized, target_volume)
    current_input = temp_normalized

    # Step 3: Mix
    if background_music and os.path.exists(background_music):
        mix_with_background_music_func(
            current_input, background_music, output_video, music_volume
        )
    else:
        logger.warning(
            "No background music provided or file not found. Copying video..."
        )
        shutil.copy(current_input, output_video)

    # Cleanup
    for f in [temp_trimmed, temp_normalized]:
        if os.path.exists(f):
            os.remove(f)

    logger.success(f"Video processing complete: {output_video}")


@app.command()
def add_subtitles(
    input_video: str,
    subtitle_file: str,
    output_video: Optional[str] = typer.Option(None, help="Output video filename"),
    gpu: bool = typer.Option(True, help="Use GPU acceleration"),
):
    """Add subtitles to video with Source Han font."""
    if not output_video:
        filename, ext = os.path.splitext(input_video)
        output_video = f"{filename}_with_subs{ext}"

    if not os.path.exists(input_video):
        logger.error(f"Input video not found: {input_video}")
        sys.exit(1)

    if not os.path.exists(subtitle_file):
        logger.error(f"Subtitle file not found: {subtitle_file}")
        sys.exit(1)

    logger.info(f"Input video: {input_video}")
    logger.info(f"Subtitle file: {subtitle_file}")
    logger.info(f"Output video: {output_video}")

    style = (
        "FontName=Source Han Sans SC,"
        "FontSize=20,"
        "PrimaryColour=&HFFFFFF,"
        "OutlineColour=&H000000,"
        "Outline=2,"
        "Shadow=1,"
        "Bold=1,"
        "MarginV=30,"
        "Alignment=2"
    )

    # Escape style string for ffmpeg
    # Note: In the original code it was just passed in f-string.
    # But complex filters often need escaping.
    # The original code: vf_filter = f"subtitles={subtitle_file}:force_style='{style}'"
    # This looks correct for most cases.

    vf_filter = f"subtitles={subtitle_file}:force_style='{style}'"

    cmd = ["ffmpeg"]
    if gpu:
        logger.info("Using GPU acceleration (NVIDIA NVENC)...")
        cmd.extend(["-hwaccel", "cuda"])

    cmd.extend(["-i", input_video, "-vf", vf_filter])

    if gpu:
        cmd.extend(["-c:v", "h264_nvenc", "-preset", "p4", "-cq", "23"])
    else:
        cmd.extend(["-c:v", "libx264", "-preset", "medium", "-crf", "23"])

    cmd.extend(["-c:a", "copy", output_video])

    try:
        subprocess.run(cmd, check=True)
        logger.success(f"Success! Output saved to: {output_video}")
    except subprocess.CalledProcessError:
        logger.error("ffmpeg command failed")
        sys.exit(1)


if __name__ == "__main__":
    app()
