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
    parser.add_argument("--claims", type=int, help="Claims to generate (generator default if omitted)")
    parser.add_argument("--members", type=int)
    parser.add_argument("--providers", type=int)
    parser.add_argument("--start", help="First service date, YYYY-MM-DD")
    parser.add_argument("--as-of", dest="as_of", help="Extract as-of date, YYYY-MM-DD (also sets the dbt as_of_date var)")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    python = sys.executable
    env_profiles = {**os.environ, "DBT_PROFILES_DIR": str(ROOT)}

    if not args.skip_generate:
        gen = [python, "scripts/generate_raw_data.py"]
        for flag, value in (
            ("--claims", args.claims),
            ("--members", args.members),
            ("--providers", args.providers),
            ("--start", args.start),
            ("--as-of", args.as_of),
        ):
            if value is not None:
                gen += [flag, str(value)]
        run(gen)
        run([python, "scripts/load_raw.py"])

    dbt_bin = ROOT / ".venv" / "Scripts" / "dbt.exe"
    if not dbt_bin.exists():
        dbt_bin = ROOT / ".venv" / "bin" / "dbt"
    dbt = [str(dbt_bin)] if dbt_bin.exists() else ["dbt"]
    dbt_vars = ["--vars", f"{{as_of_date: '{args.as_of}'}}"] if args.as_of else []
    subprocess.run(dbt + ["deps"], cwd=ROOT, check=True, env=env_profiles)
    subprocess.run(dbt + ["seed"], cwd=ROOT, check=True, env=env_profiles)
    subprocess.run(dbt + ["run"] + dbt_vars, cwd=ROOT, check=True, env=env_profiles)
    if not args.skip_test:
        subprocess.run(dbt + ["test"] + dbt_vars, cwd=ROOT, check=True, env=env_profiles)
    print("Pipeline complete. Launch the dashboard with:")
    print(f"  {python} -m streamlit run dashboards/app.py")


if __name__ == "__main__":
    main()
