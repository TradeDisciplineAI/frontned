import os

# 1. Update database.py in AI-Service
database_path = r'C:\Users\SREENAND PK\Desktop\Trading\AI-Service\src\database.py'
with open(database_path, 'r', encoding='utf-8') as f:
    db_code = f.read()

db_code = db_code.replace(
    'portfolio_id = Column(UUID(as_uuid=True), nullable=False, index=True)',
    'portfolio_id = Column(UUID(as_uuid=True), nullable=True, index=True)'
)
with open(database_path, 'w', encoding='utf-8') as f:
    f.write(db_code)

# 2. Update schemas.py in AI-Service
schemas_path = r'C:\Users\SREENAND PK\Desktop\Trading\AI-Service\src\schemas.py'
with open(schemas_path, 'r', encoding='utf-8') as f:
    schemas_code = f.read()

schemas_code = schemas_code.replace(
    'portfolio_id: UUID',
    'portfolio_id: Optional[UUID] = None'
)
with open(schemas_path, 'w', encoding='utf-8') as f:
    f.write(schemas_code)

print('Updated AI-Service backward compatibility for portfolio_id OK')
