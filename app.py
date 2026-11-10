from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from datetime import datetime

# Configuração do Banco de Dados SQLite
DATABASE_URL = "sqlite:///./app_care.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Modelo da Tabela no Banco de Dados
class UsuarioDB(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, index=True)
    idade = Column(Integer)
    genero = Column(String)
    profissao = Column(String)
    turno_trabalho = Column(String) # ex: "09:00 - 18:00"
    pontuacao = Column(Integer, default=0)
    criado_em = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

# Schemas Pydantic
class UsuarioCreate(BaseModel):
    nome: str
    idade: int
    genero: str
    profissao: str
    turno_trabalho: str

class PontuacaoUpdate(BaseModel):
    pontos: int

app = FastAPI(title="API CareForDev Ergonômico")

# Habilitar CORS para o frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Rotas da API
@app.post("/usuarios/")
def criar_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    db_user = UsuarioDB(**usuario.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/usuarios/{user_id}")
def obter_usuario(user_id: int, db: Session = Depends(get_db)):
    user = db.query(UsuarioDB).filter(UsuarioDB.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return user

@app.put("/usuarios/{user_id}/pontuacao")
def adicionar_pontuacao(user_id: int, payload: PontuacaoUpdate, db: Session = Depends(get_db)):
    user = db.query(UsuarioDB).filter(UsuarioDB.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    user.pontuacao += payload.pontos
    db.commit()
    db.refresh(user)
    return {"id": user.id, "nome": user.nome, "nova_pontuacao": user.pontuacao}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)