"""Fail CI when tracked source contains high confidence credential patterns."""
import re
import subprocess
import sys
from pathlib import Path

PATTERNS = {
    "private key": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    "GitHub token": re.compile(r"\bgh[pousr]_[A-Za-z0-9]{30,}\b"),
    "AWS access key": re.compile(r"\bAKIA[A-Z0-9]{16}\b"),
    "OpenAI project key": re.compile(r"\bsk-proj-[A-Za-z0-9_-]{20,}\b"),
    "Stripe live key": re.compile(r"\bsk_live_[A-Za-z0-9]{20,}\b"),
}


def tracked_files():
    output = subprocess.check_output(["git", "ls-files", "-z"])
    return [Path(item.decode()) for item in output.split(b"\0") if item]


def main():
    findings = []
    for path in tracked_files():
        try:
            content = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        for label, pattern in PATTERNS.items():
            for match in pattern.finditer(content):
                line = content.count("\n", 0, match.start()) + 1
                findings.append(f"{path}:{line}: possible {label}")
    if findings:
        print("\n".join(findings))
        return 1
    print("No high confidence secrets found in tracked source.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
