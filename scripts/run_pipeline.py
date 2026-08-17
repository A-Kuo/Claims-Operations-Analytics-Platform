"""Generate extracts, load DuckDB, and run dbt from the project root."""

from __future__ import annotations

import argparse
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def run(cmd: list[str]) -> None:
    print("+", " ".join(cmd), flush=True)
    subprocess.run(cmd, cwd=ROOT, check=True)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the local claims analytics pipeline")
    parser.add_argument("--skip-generate", action="store_true")
    parser.add_argument("--skip-test", action="store_true")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    python = sys.executable
    env_profiles = {**os.environ, "DBT_PROFILES_DIR": str(ROOT)}

    if not args.skip_generate:
        run([python, "scripts/generate_raw_data.py"])
        run([python, "scripts/load_raw.py"])

    dbt_bin = ROOT / ".venv" / "Scripts" / "dbt.exe"
    if not dbt_bin.exists():
        dbt_bin = ROOT / ".venv" / "bin" / "dbt"
    dbt = [str(dbt_bin)] if dbt_bin.exists() else ["dbt"]
    subprocess.run(dbt + ["deps"], cwd=ROOT, check=True, env=env_profiles)
    subprocess.run(dbt + ["seed"], cwd=ROOT, check=True, env=env_profiles)
    subprocess.run(dbt + ["run"], cwd=ROOT, check=True, env=env_profiles)
    if not args.skip_test:
        subprocess.run(dbt + ["test"], cwd=ROOT, check=True, env=env_profiles)
    print("Pipeline complete. Launch the dashboard with:")
    print(f"  {python} -m streamlit run dashboards/app.py")


if __name__ == "__main__":
    main()
