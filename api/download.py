import os
import sys
import platform
import subprocess
import json
import yt_dlp
from rich.console import Console

console = Console()

def get_supported_format(quality):
    return {
        'best': 'bestvideo[ext=mp4][vcodec^=avc1]+bestaudio/best[ext=mp4]',
        'medium': 'bestvideo[height<=720][ext=mp4][vcodec^=avc1]+bestaudio/best[height<=720][ext=mp4]',
        'low': 'bestvideo[height<=480][ext=mp4][vcodec^=avc1]+bestaudio/best[height<=480][ext=mp4]',
        'audio': 'bestaudio/best'
    }.get(quality, 'bestvideo[ext=mp4][vcodec^=avc1]+bestaudio/best[ext=mp4]')

def download_with_progress(url, quality, output_path):
    os.makedirs(output_path, exist_ok=True)
    
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'outtmpl': os.path.join(output_path, '%(title)s.%(ext)s'),
        'merge_output_format': 'mp4',
        'format': get_supported_format(quality),
        'windowsfilenames': True,
    }

    if quality == 'audio':
        ydl_opts.update({
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
            'merge_output_format': None,
        })

    progress_messages = []

    def update_progress(d):
        status = d.get('status')
        if status == 'downloading':
            filename = d.get('filename', '').split(os.sep)[-1]
            progress_messages.append(f"Downloading: {filename}")
        elif status == 'finished':
            progress_messages.append("Processing video...")

    ydl_opts['progress_hooks'] = [update_progress]

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
        title = info.get('title', 'video').replace(' ', '_')[:50]
        ext = 'mp3' if quality == 'audio' else 'mp4'
        file_path = os.path.join(output_path, f"{title}.{ext}")
        return file_path, progress_messages, None
    except Exception as e:
        console.print(f"Error during download: {e}", style="red")
        return None, progress_messages, str(e)

def handler(request):
    """
    Vercel serverless function entry point.
    Expects query parameters:
      - url: the YouTube video URL.
      - quality: one of 'best', 'medium', 'low', or 'audio' (default 'best').
    """
    params = request.args
    url = params.get("url")
    quality = params.get("quality", "best").lower()

    if not url:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Missing 'url' query parameter."})
        }

    # Use /tmp for ephemeral storage in Vercel
    output_path = "/tmp/downloads"
    console.log(f"Downloading URL: {url} with quality: {quality}")

    file_path, progress_msgs, error = download_with_progress(url, quality, output_path)
    if error:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": error, "progress": progress_msgs})
        }

    response_body = {
        "message": "Download complete!",
        "file_path": file_path,
        "progress": progress_msgs
    }
    return {
        "statusCode": 200,
        "body": json.dumps(response_body)
    }

if __name__ == "__main__":
    # This block won't run on Vercel, but it's here for local testing.
    from werkzeug.serving import run_simple
    def local_handler(environ, start_response):
        from urllib.parse import parse_qs
        query = parse_qs(environ.get('QUERY_STRING', ''))
        request_args = {k: v[0] for k, v in query.items()}
        class DummyRequest:
            args = request_args
        response = handler(DummyRequest())
        start_response(f"{response['statusCode']} OK", [("Content-Type", "application/json")])
        return [response['body'].encode()]
    run_simple('localhost', 8000, local_handler)
