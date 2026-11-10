const API_URL = "http://127.0.0.1:8000";
let usuarioAtualId = 1;

// Inicializa a aplicação buscando dados do usuário
document.addEventListener("DOMContentLoaded", () => {
    carregarUsuario();
});

// Busca dados do banco via API Python
async function carregarUsuario() {
    try {
        const response = await fetch(`${API_URL}/usuarios/${usuarioAtualId}`);
        if (response.ok) {
            const data = await response.json();
            document.getElementById("user-greeting").innerText = `Bom dia, ${data.nome}.`;
            document.getElementById("user-role").innerText = data.profissao;
            document.getElementById("user-shift").innerText = data.turno_trabalho;
        } else {
            // Se não existir, cria o usuário padrão no banco
            criarUsuarioPadrao();
        }
    } catch (error) {
        console.error("Erro ao conectar com o banco de dados:", error);
    }
}

// Envia dados iniciais do usuário ao banco
async function criarUsuarioPadrao() {
    const usuarioDemo = {
        nome: "Emilly Sandy",
        idade: 25,
        genero: "Feminino",
        profissao: "Desenvolvedora Front-end",
        turno_trabalho: "09:00 — 18:00"
    };

    try {
        const response = await fetch(`${API_URL}/usuarios/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(usuarioDemo)
        });
        const data = await response.json();
        usuarioAtualId = data.id;
        carregarUsuario();
    } catch (error) {
        console.error("Erro ao registrar usuário:", error);
    }
}

// Função executada ao clicar no botão de concluir pausa
async function concluirAtividade(botao, pontos) {
    try {
        const response = await fetch(`${API_URL}/usuarios/${usuarioAtualId}/pontuacao`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pontos: pontos })
        });

        if (response.ok) {
            const resData = await response.json();
            // Atualiza o botão para concluído
            botao.className = "btn-check done";
            botao.innerHTML = '<i class="fa-solid fa-check"></i>';
            botao.disabled = true;

            alert(`Pausa concluída! +${pontos} pontos registrados no banco. Pontuação total: ${resData.nova_pontuacao}`);
        }
    } catch (error) {
        console.error("Erro ao atualizar pontuação no banco:", error);
    }
}