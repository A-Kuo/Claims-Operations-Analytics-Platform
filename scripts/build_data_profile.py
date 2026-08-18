"""Summarize the last `dbt test` run into a committed metrics/data_profile.json.

Reads dbt's own run artifacts (target/run_results.json, target/manifest.json)
so the "reliable datasets" / "standardized metric calculations" claims in the
README are backed by real, inspectable test output instead of typed prose.
"""

from __future__ import annotations

import json
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "target"
OUT = ROOT / "metrics" / "data_profile.json"


def load(path: Path) -> dict:
    return json.loads(path.read_text())


def resolve_model_name(dep_id: str, manifest: dict) -> str | None:
    if dep_id in manifest["nodes"]:
        return manifest["nodes"][dep_id]["name"]
    if dep_id in manifest["sources"]:
        return manifest["sources"][dep_id]["name"]
    return None


def resolve_test(unique_id: str, manifest: dict) -> dict:
    node = manifest["nodes"][unique_id]
    meta = node.get("test_metadata")
    test_type = meta["name"] if meta else "singular"
    dep_nodes = node.get("depends_on", {}).get("nodes", [])
    model = resolve_model_name(dep_nodes[0], manifest) if dep_nodes else None
    return {
        "name": node["name"],
        "kind": "data_test",
        "test_type": test_type,
        "model": model,
        "column": node.get("column_name"),
    }


def resolve_unit_test(unique_id: str, manifest: dict) -> dict:
    node = manifest["unit_tests"][unique_id]
    return {
        "name": node["name"],
        "kind": "unit_test",
        "test_type": "unit_test",
        "model": node.get("model"),
        "column": None,
    }


def bucket(tests: list[dict]) -> dict:
    counts = Counter(t["status"] for t in tests)
    return {
        "total": len(tests),
        "pass": counts["pass"],
        "fail": counts["fail"],
        "error": counts["error"],
        "skip": counts["skip"],
    }


def main() -> None:
    run_results_path = TARGET / "run_results.json"
    if not run_results_path.exists():
        sys.exit(f"{run_results_path} not found — run `dbt test` first.")

    run_results = load(run_results_path)
    manifest = load(TARGET / "manifest.json")

    tests = []
    for result in run_results["results"]:
        unique_id = result["unique_id"]
        if unique_id in manifest.get("unit_tests", {}):
            info = resolve_unit_test(unique_id, manifest)
        elif unique_id in manifest["nodes"] and manifest["nodes"][unique_id].get("resource_type") == "test":
            info = resolve_test(unique_id, manifest)
        else:
            continue

        tests.append(
            {
                "unique_id": unique_id,
                "name": info["name"],
                "kind": info["kind"],
                "test_type": info["test_type"],
                "model": info["model"],
                "column": info["column"],
                "status": result["status"],
                "execution_time": round(result.get("execution_time", 0.0), 3),
            }
        )

    tests.sort(key=lambda t: (t["kind"], t["model"] or "", t["name"]))
    data_tests = [t for t in tests if t["kind"] == "data_test"]
    unit_tests = [t for t in tests if t["kind"] == "unit_test"]

    profile = {
        "generated_at": run_results["metadata"]["generated_at"],
        "dbt_version": run_results["metadata"]["dbt_version"],
        "adapter": "duckdb",
        "target": run_results.get("args", {}).get("target") or "dev",
        "summary": {
            "total": bucket(tests),
            "data_tests": bucket(data_tests),
            "unit_tests": bucket(unit_tests),
        },
        "tests": tests,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(profile, indent=2) + "\n")

    s = profile["summary"]
    print(
        f"wrote {OUT}: {s['total']['pass']}/{s['total']['total']} passed "
        f"({s['data_tests']['total']} data tests, {s['unit_tests']['total']} unit tests)"
    )


if __name__ == "__main__":
    main()
