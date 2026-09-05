"""Read only production smoke checks for a deployed Chatterbot API."""
import json
import os
import sys
import urllib.error
import urllib.request


def fetch_json(url, headers=None):
    request = urllib.request.Request(url, headers=headers or {})
    with urllib.request.urlopen(request, timeout=15) as response:
        if response.status != 200:
            raise RuntimeError(f"{url} returned HTTP {response.status}")
        return json.loads(response.read().decode("utf-8"))


def main():
    base_url = os.environ.get("STAGING_API_URL", "").rstrip("/")
    admin_key = os.environ.get("STAGING_ADMIN_API_KEY", "")
    if not base_url.startswith("https://"):
        print("STAGING_API_URL must be an HTTPS URL", file=sys.stderr)
        return 2
    if not admin_key:
        print("STAGING_ADMIN_API_KEY is required", file=sys.stderr)
        return 2

    try:
        live = fetch_json(f"{base_url}/health/live")
        ready = fetch_json(f"{base_url}/health/ready")
        operations = fetch_json(
            f"{base_url}/api/admin/operations",
            {"X-Admin-API-Key": admin_key},
        )
    except (urllib.error.URLError, ValueError, RuntimeError) as exc:
        print(f"Smoke test failed: {exc}", file=sys.stderr)
        return 1

    if live.get("status") != "alive" or ready.get("ready") is not True:
        print("Smoke test failed: deployment is not ready", file=sys.stderr)
        return 1
    if operations.get("open_critical", 0):
        print("Smoke test failed: unresolved critical operational events", file=sys.stderr)
        return 1
    print("Staging API is live, ready, and has no open critical events.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
