from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_head(self):
        self.byte_range = None
        path = Path(self.translate_path(self.path))
        header = self.headers.get('Range')
        if not header or not path.is_file():
            return super().send_head()
        match = re.fullmatch(r'bytes=(\d+)-(\d*)', header)
        if not match:
            return super().send_head()
        size = path.stat().st_size
        start = int(match.group(1))
        end = min(int(match.group(2)) if match.group(2) else size - 1, size - 1)
        if start > end:
            self.send_response(416)
            self.send_header('Content-Range', f'bytes */{size}')
            self.end_headers()
            return None
        self.send_response(206)
        self.send_header('Content-Type', self.guess_type(str(path)))
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
        self.send_header('Content-Length', str(end-start+1))
        self.end_headers()
        self.byte_range = (start, end)
        stream = path.open('rb')
        stream.seek(start)
        return stream

    def copyfile(self, source, target):
        if self.byte_range is None:
            return super().copyfile(source, target)
        remaining = self.byte_range[1]-self.byte_range[0]+1
        while remaining:
            data = source.read(min(65536, remaining))
            if not data:
                break
            target.write(data)
            remaining -= len(data)


ThreadingHTTPServer(('127.0.0.1', 8765), Handler).serve_forever()
