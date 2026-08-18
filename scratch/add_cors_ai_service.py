import os

main_path = r'C:\Users\SREENAND PK\Desktop\Trading\AI-Service\src\main.py'
with open(main_path, 'r', encoding='utf-8') as f:
    code = f.read()

if 'CORSMiddleware' not in code:
    old_imports = 'from fastapi import FastAPI'
    new_imports = 'from fastapi import FastAPI\nfrom fastapi.middleware.cors import CORSMiddleware'

    old_app = 'app = FastAPI(title="AI Trading Service API (Agents 1, 2, 3 & 6)")'
    new_app = '''app = FastAPI(title="AI Trading Service API (Agents 1, 2, 3 & 6)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)'''

    code = code.replace(old_imports, new_imports, 1)
    code = code.replace(old_app, new_app, 1)

    with open(main_path, 'w', encoding='utf-8') as f:
        f.write(code)
    print('CORSMiddleware added to AI-Service main.py successfully')
else:
    print('CORSMiddleware already present in AI-Service main.py')
