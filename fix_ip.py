import glob

for f in glob.glob('src/**/*.jsx', recursive=True):
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    modified = False
    if '192.168.0.112:8000' in content:
        content = content.replace('192.168.0.112:8000', 'localhost:8000')
        modified = True
    if '127.0.0.1:8000' in content:
        content = content.replace('127.0.0.1:8000', 'localhost:8000')
        modified = True
        
    if modified:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
