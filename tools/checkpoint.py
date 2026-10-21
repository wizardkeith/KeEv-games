"""Build a closed, atomic source ZIP and verify every canonical Git blob.

Run only after publication, with its real receipt and final handoff. Delivery
metadata is deliberately additional to the immutable source commit.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import tempfile
import zipfile


def digest(data):
    return hashlib.sha256(data).hexdigest()


def atomic_write(path, data):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=path.parent, prefix="checkpoint-", suffix=".partial", delete=False) as f:
        temporary = Path(f.name)
        f.write(data)
        f.flush()
        os.fsync(f.fileno())
    os.replace(temporary, path)


def main():
    p = argparse.ArgumentParser(description=__doc__)
    for name in ("repo", "commit", "receipt", "handoff", "output", "report"):
        p.add_argument("--" + name, required=True)
    a = p.parse_args()
    repo, output = Path(a.repo).resolve(), Path(a.output).resolve()
    git = lambda *args: subprocess.check_output(["git", *args], cwd=repo)
    commit = git("rev-parse", a.commit + "^{commit}").decode().strip()
    receipt = Path(a.receipt).read_bytes()
    assert json.loads(receipt)["source_commit"] == commit
    handoff = Path(a.handoff).read_bytes()
    assert b"DELIVERY_RECEIPT.json" in handoff
    tree = []
    for record in git("ls-tree", "-rz", "--full-tree", commit).split(b"\0"):
        if not record:
            continue
        header, name = record.split(b"\t", 1)
        mode, kind, oid = header.decode().split()
        assert kind == "blob" and mode in ("100644", "100755"), header
        tree.append((name.decode(), mode, oid))
    names = {name for name, _, _ in tree}
    for required in ("tsconfig.json", "package-lock.json", "src/main.ts", "docs/HANDOFF.md"):
        assert required in names, required
    for prefix in ("src/", "tests/", "tools/", "assets/masters/", "source-inputs/source_bible/"):
        assert any(n.startswith(prefix) for n in names), prefix
    assert not any(n.startswith(("node_modules/", "dist/", ".git/")) or n.endswith(".env") for n in names)
    extras = {"DELIVERY_RECEIPT.json": receipt, "HANDOFF_FINAL.md": handoff, "HANDOFF_FINAL.txt": handoff}
    assert not names.intersection(extras)
    hashes = {}
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="checkpoint-build-", dir=output.parent) as staging:
        temporary = Path(staging) / "source.partial"
        with zipfile.ZipFile(temporary, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as z:
            for name, mode, oid in tree:
                data = git("cat-file", "blob", oid)
                hashes[name] = digest(data)
                info = zipfile.ZipInfo(name)
                info.compress_type = zipfile.ZIP_DEFLATED
                info.external_attr = (0o100755 if mode == "100755" else 0o100644) << 16
                z.writestr(info, data)
            manifest = "".join(f"{hashes[n]}  {n}\n" for n in sorted(hashes)).encode()
            extras["SOURCE_MANIFEST.sha256"] = manifest
            for name, data in extras.items():
                z.writestr(name, data)
        # The writer is CLOSED before any normal-reader integrity test or exposure.
        with temporary.open("rb") as f:
            os.fsync(f.fileno())
        with zipfile.ZipFile(temporary, "r") as z:
            entries = z.namelist()
            assert len(entries) == len(set(entries)), "duplicate entries"
            assert set(entries) == names.union(extras), "missing or unexpected source/metadata"
            assert z.testzip() is None, "CRC failure"
            for name, expected in hashes.items():
                assert digest(z.read(name)) == expected, name
            for name, data in extras.items():
                assert z.read(name) == data, name
            assert json.loads(z.read("DELIVERY_RECEIPT.json"))["source_commit"] == commit
        # Only the fully written, closed and verified file receives the final name.
        os.replace(temporary, output)
    report = {"source_commit": commit, "filename": output.name,
              "size_bytes": output.stat().st_size, "sha256": digest(output.read_bytes()),
              "tracked_files": len(tree), "entries": len(entries),
              "crc": "PASS", "entry_list": "PASS", "every_git_blob_sha256": "PASS",
              "source_manifest": "SOURCE_MANIFEST.sha256", "deployment_receipt": "DELIVERY_RECEIPT.json",
              "metadata_origin": "Receipt from actual Sites calls after source commit; final handoff adds publication details. Both are delivery metadata, not Git blobs.",
              "method": "Closed ZIP writer, normal ZipFile reader: full CRC, exact entry set and every canonical Git blob SHA256. Atomic rename after validation; archive is not modified afterward."}
    atomic_write(a.report, (json.dumps(report, indent=2) + "\n").encode())
    print(json.dumps(report))


if __name__ == "__main__":
    main()
