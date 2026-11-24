// Sem banco de dados: o perfil e a pontuação ficam salvos no próprio navegador (localStorage).
// Os dados são por aparelho/navegador: não são compartilhados entre dispositivos.
const CHAVE_USUARIO = "carefordev:usuario";
let usuario = { nome: "", idade: "", genero: "", profissao: "", turno_trabalho: "", pontuacao: 0 };
let totalConcluidas = 0;
const totalTarefas = 3;

document.addEventListener("DOMContentLoaded", () => {
    carregarUsuario();
    // Link "Perfil" vindo de outra página (ex.: saude.html -> index.html#perfil)
    if (window.location.hash === "#perfil") abrirModal();
});

function lerUsuarioSalvo() {
    try {
        const bruto = localStorage.getItem(CHAVE_USUARIO);
        return bruto ? JSON.parse(bruto) : null;
    } catch (erro) {
        console.error("Não foi possível ler os dados salvos:", erro);
        return null;
    }
}

function salvarNoNavegador() {
    try {
        localStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));
    } catch (erro) {
        console.error("Não foi possível salvar os dados:", erro);
    }
}

function carregarUsuario() {
    const salvo = lerUsuarioSalvo();
    if (salvo && salvo.nome) {
        usuario = { ...usuario, ...salvo };
        atualizarTela(usuario);
    } else {
        abrirModal(); // primeiro acesso: pede o perfil
    }
}

function atualizarTela(data) {
    document.getElementById("user-greeting").innerText = `Bom dia, ${data.nome}.`;
    document.getElementById("user-role").innerText = data.profissao;
    document.getElementById("user-shift").innerText = data.turno_trabalho;
    document.getElementById("score-text").innerText = `Pontuação: ${data.pontuacao} pts`;

    document.getElementById("input-nome").value = data.nome || '';
    document.getElementById("input-idade").value = data.idade || '';
    document.getElementById("input-genero").value = data.genero || '';
    document.getElementById("input-profissao").value = data.profissao || '';
    document.getElementById("input-turno").value = data.turno_trabalho || '';
}

function concluirAtividade(botao, pontos) {
    if (botao.disabled) return;

    // 1) Feedback imediato: botão e bolinha do horário ficam verdes.
    botao.className = "btn-check done";
    botao.innerHTML = '<i class="fa-solid fa-check"></i>';
    botao.disabled = true;
    botao.setAttribute("aria-label", "Atividade concluída");
    const item = botao.closest(".timeline-item");
    item.classList.add("done");
    item.querySelector(".dot").classList.add("active");

    totalConcluidas++;
    const pct = Math.round((totalConcluidas / totalTarefas) * 100);
    document.getElementById("tasks-count").innerText = `${totalConcluidas}/${totalTarefas} feitas`;
    document.getElementById("main-progress").style.width = `${pct}%`;
    document.getElementById("progress-percent").innerText = `${pct}% da jornada`;

    // 2) Pontuação: soma e guarda no navegador.
    usuario.pontuacao = (Number(usuario.pontuacao) || 0) + pontos;
    salvarNoNavegador();
    document.getElementById("score-text").innerText = `Pontuação: ${usuario.pontuacao} pts`;
}

function salvarUsuario(event) {
    event.preventDefault();

    usuario = {
        ...usuario,
        nome: document.getElementById("input-nome").value.trim(),
        idade: parseInt(document.getElementById("input-idade").value, 10) || "",
        genero: document.getElementById("input-genero").value,
        profissao: document.getElementById("input-profissao").value.trim(),
        turno_trabalho: document.getElementById("input-turno").value
    };
    salvarNoNavegador();
    atualizarTela(usuario);
    fecharModal();
}

function abrirModal() {
    document.getElementById("modal-user").classList.add("active");
}

function fecharModal() {
    document.getElementById("modal-user").classList.remove("active");
}
