import os
from os import path
import re
import shutil
from send2trash import send2trash


def is_video(filepath: str) -> bool:
    for ext in ['mp4', 'flv', 'mkv', 'mov', 'm4v']:
        if filepath.lower().endswith(ext):
            return True
    return False


def normalize_subfolder_videos(p: str, subroot: str):
    for f in os.listdir(p):
        fp = path.join(p, f)
        if path.isfile(fp):
            if is_video(fp):
                if p != subroot:
                    nfp = path.join(subroot, f)
                    print(f"move {nfp} to {fp}")
                    shutil.move(fp, nfp)
            else:
                print(f"remove {fp}")
                send2trash(fp)
        else:
            normalize_subfolder_videos(fp, subroot)
            print(f"finish folder {fp} normalize, removing")
            send2trash(fp)


def is_duplicate(fp: str):
    return re.search(r"\(\d+\)\.[\w\d]+$", fp) is not None


def deduplicate_videos(subroot: str):
    for f in os.listdir(subroot):
        p = path.join(subroot, f)
        if path.isfile(p) and is_video(p) and is_duplicate(p):
            print(f"remove duplicate video {p}")
            send2trash(p)


def normalize_subfolder(p: str, root: str) -> bool:
    f = path.dirname(p)
    year = re.search(r"\d{4}(?=[年])", f)
    month = re.search(r"\d{1,2}(?=[月])", f)
    kind = re.search(r"[23][Dd]", f)
    if year is None and month is None:
        return False
    if kind is None:
        k = "2D"
    else:
        k = kind.group().upper()
    y = year.group()
    m = month.group()
    m = m if len(m) == 2 else '0' + m
    nf = f"{y}.{m}.{k}"
    yf = f"{y}.{k}"
    pyf = path.join(root, yf)
    pnf = path.join(root, nf)
    os.makedirs(pyf, exist_ok=True)
    if p == pnf:
        return True
    print(f"normalize {p} to {pnf}")
    shutil.move(p, pnf)
    normalize_subfolder_videos(pnf, pnf)
    deduplicate_videos(pnf)
    return True


def normalize_subfolder_recursive(p: str, root: str):
    for f in os.listdir(p):
        pf = path.join(p, f)
        if path.isdir(pf) and not normalize_subfolder(pf, root):
            normalize_subfolder_recursive(pf, root)


if __name__ == "__main__":
    normalize_subfolder_recursive(".", ".")
