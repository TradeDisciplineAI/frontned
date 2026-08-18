import os

# 1. Update database.py in AI-Service
database_path = r'C:\Users\SREENAND PK\Desktop\Trading\AI-Service\src\database.py'
with open(database_path, 'r', encoding='utf-8') as f:
    db_code = f.read()

if 'portfolio_id = Column' not in db_code:
    old_snippet = '    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)'
    new_snippet = '    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)\n    portfolio_id = Column(UUID(as_uuid=True), nullable=False, index=True)'
    db_code = db_code.replace(old_snippet, new_snippet, 1)
    with open(database_path, 'w', encoding='utf-8') as f:
        f.write(db_code)
    print('Updated database.py in AI-Service OK')

# 2. Update schemas.py in AI-Service
schemas_path = r'C:\Users\SREENAND PK\Desktop\Trading\AI-Service\src\schemas.py'
with open(schemas_path, 'r', encoding='utf-8') as f:
    schemas_code = f.read()

if 'portfolio_id: UUID' not in schemas_code:
    old_create = 'class TradeProposalCreate(BaseModel):\n    user_id: UUID'
    new_create = 'class TradeProposalCreate(BaseModel):\n    user_id: UUID\n    portfolio_id: UUID'

    old_resp = 'class TradeProposalResponse(BaseModel):\n    id: UUID\n    user_id: UUID'
    new_resp = 'class TradeProposalResponse(BaseModel):\n    id: UUID\n    user_id: UUID\n    portfolio_id: UUID'

    schemas_code = schemas_code.replace(old_create, new_create, 1)
    schemas_code = schemas_code.replace(old_resp, new_resp, 1)

    with open(schemas_path, 'w', encoding='utf-8') as f:
        f.write(schemas_code)
    print('Updated schemas.py in AI-Service OK')

# 3. Update trade_proposal_service.py in AI-Service
service_path = r'C:\Users\SREENAND PK\Desktop\Trading\AI-Service\src\trade_proposal_service.py'
with open(service_path, 'r', encoding='utf-8') as f:
    service_code = f.read()

if 'portfolio_id=proposal_in.portfolio_id' not in service_code:
    old_inst = '        proposal = TradeProposal(\n            user_id=proposal_in.user_id,'
    new_inst = '        proposal = TradeProposal(\n            user_id=proposal_in.user_id,\n            portfolio_id=proposal_in.portfolio_id,'
    service_code = service_code.replace(old_inst, new_inst, 1)
    with open(service_path, 'w', encoding='utf-8') as f:
        f.write(service_code)
    print('Updated trade_proposal_service.py in AI-Service OK')

print('AI-Service updates completed successfully.')
