import os, glob

for filepath in glob.glob("src/**/*.jsx", recursive=True):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    if "127.0.0.1:8000" in content:
        content = content.replace("127.0.0.1:8000", "192.168.0.112:8000")
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
