import subprocess
import time
import sys
while True:
    p = subprocess.Popen(["python", "crawler.py", ""])
    time.sleep(120)
    # Send SIGTER (on Linux)
    p.terminate()
    p.wait()
    sys.stdout.flush()
