// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDnzDkInpxKQcx_Jw8MB-zIhTLzKyzNSyM",
    authDomain: "gerenciador-vendas-ac4bf.firebaseapp.com",
    projectId: "gerenciador-vendas-ac4bf",
    storageBucket: "gerenciador-vendas-ac4bf.firebasestorage.app",
    messagingSenderId: "789648456187",
    appId: "1:789648456187:web:115afacd28fdecf27d335e"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Inicializar Firestore
const db = firebase.firestore();

// Teste de conexão com Firebase
console.log('Testando conexão com Firebase...');
db.collection('vendas').get()
    .then(snapshot => {
        console.log('Conexão com Firebase OK!');
        console.log('Número de vendas:', snapshot.size);
    })
    .catch(error => {
        console.error('Erro na conexão com Firebase:', error);
    });

// Array global para vendas
let vendas = [];

// Funções do Firebase
async function carregarVendas() {
    try {
        const snapshot = await db.collection('vendas').get();
        vendas = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        console.log('Vendas carregadas:', vendas.length);
        updateDebugInfo();
        atualizarTabela();
    } catch (error) {
        console.error('Erro ao carregar vendas:', error);
        alert('Erro ao carregar banco de dados.');
    }
}

async function salvarVenda(venda) {
    try {
        const docRef = await db.collection('vendas').add(venda);
        console.log('Venda salva com ID:', docRef.id);
        return true;
    } catch (error) {
        console.error('Erro ao salvar venda:', error);
        return false;
    }
}

async function excluirVenda(id) {
    try {
        await db.collection('vendas').doc(id).delete();
        await carregarVendas();
        return true;
    } catch (error) {
        console.error('Erro ao excluir venda:', error);
        return false;
    }
}

// Funções de email
async function enviarEmailNovaVenda(venda) {
    try {
        const templateParams = {
            to_email: 'davidmeirshrem@gmail.com',
            to_name: String(venda.nomeComprador || ''),
            from_name: 'Sistema de Vendas',
            subject: 'Nova Venda Registrada',
            message: `
                Nova venda registrada com sucesso!

                Produto: ${venda.produto}
                Origem: ${venda.origemProduto || 'N/A'}
                Serial: ${venda.numeroSerial || 'N/A'}
                Data da Compra: ${new Date(venda.dataCompra).toLocaleDateString()}
                Data de Vencimento: ${new Date(venda.dataVencimento).toLocaleDateString()}
                Valor: ₪${venda.precoVenda}
                Status: ${venda.statusPagamento}
                Observações: ${venda.anotacoes || 'N/A'}
            `.trim()
        };

        await emailjs.send(
            'service_lb5yt39',
            'template_o0acrgq',
            templateParams,
            'hOEhCYJwa_99mn944'
        );
    } catch (error) {
        console.error('Erro ao enviar email de nova venda:', error);
    }
}

// Função para verificar vencimentos
async function verificarVencimentos() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    vendas.forEach(async (venda) => {
        const dataVencimento = new Date(venda.dataVencimento);
        dataVencimento.setHours(0, 0, 0, 0);

        const diffDias = Math.floor((dataVencimento - hoje) / (1000 * 60 * 60 * 24));

        if (diffDias === 7 || diffDias === 0) {
            try {
                const templateParams = {
                    to_email: 'davidmeirshrem@gmail.com',
                    to_name: String(venda.nomeComprador || ''),
                    from_name: 'Sistema de Vendas',
                    subject: diffDias === 7 ? 'Alerta: Produto Próximo ao Vencimento' : 'Alerta: Produto Venceu Hoje',
                    message: `
                        ${diffDias === 7 ? 'ALERTA: Produto irá vencer em 7 dias!' : 'ALERTA: Produto venceu hoje!'}

                        Produto: ${venda.produto}
                        Cliente: ${venda.nomeComprador}
                        Data de Vencimento: ${new Date(venda.dataVencimento).toLocaleDateString()}
                        Serial: ${venda.numeroSerial || 'N/A'}
                    `.trim()
                };

                await emailjs.send('service_lb5yt39', 'template_o0acrgq', templateParams, 'hOEhCYJwa_99mn944');
            } catch (error) {
                console.error('Erro ao enviar alerta:', error);
            }
        }
    });
}

// Função para iniciar verificação de vencimentos
function iniciarVerificacaoVencimentos() {
    verificarVencimentos();
    const agora = new Date();
    const proximaMeiaNoite = new Date(agora);
    proximaMeiaNoite.setHours(24, 0, 0, 0);
    const msAteProximaVerificacao = proximaMeiaNoite - agora;

    setTimeout(() => {
        verificarVencimentos();
        setInterval(verificarVencimentos, 24 * 60 * 60 * 1000);
    }, msAteProximaVerificacao);
}

// Função para atualizar debug info
function updateDebugInfo() {
    const debugInfo = document.getElementById('debugInfo');
    if (!debugInfo) return;
    
    const info = {
        totalVendas: vendas.length,
        tamanhoStorage: new Blob([JSON.stringify(vendas)]).size / 1024,
        ultimaAtualizacao: new Date().toLocaleString()
    };
    
    debugInfo.innerHTML = `
        <div>Total de Vendas: ${info.totalVendas}</div>
        <div>Tamanho do Storage: ${info.tamanhoStorage.toFixed(2)}KB</div>
        <div>Última Atualização: ${info.ultimaAtualizacao}</div>
    `;
}

// Função para atualizar tabela
function atualizarTabela() {
    const todasVendas = document.getElementById('todasVendas');
    if (!todasVendas) return;
    
    todasVendas.innerHTML = '';
    if (!vendas.length) return;

    // Agrupar vendas por mês
    const vendasPorMes = {};
    vendas.sort((a, b) => new Date(b.dataCompra) - new Date(a.dataCompra))
          .forEach(venda => {
              const mesAno = venda.dataCompra.substring(0, 7);
              if (!vendasPorMes[mesAno]) vendasPorMes[mesAno] = [];
              vendasPorMes[mesAno].push(venda);
          });

    // Criar grupos de mês
    Object.entries(vendasPorMes).forEach(([mesAno, vendasDoMes]) => {
        const template = document.getElementById('templateGrupoMes');
        if (!template) return;

        const clone = template.content.cloneNode(true);
        const mesAnoElement = clone.querySelector('.mes-ano');
        const totalMes = clone.querySelector('.total-mes');
        const tbody = clone.querySelector('.vendas-mes');

        const [ano, mes] = mesAno.split('-');
        const data = new Date(ano, mes - 1);
        mesAnoElement.textContent = data.toLocaleDateString(idiomaAtual === 'he' ? 'he-IL' : 'pt-BR', {
            month: 'long',
            year: 'numeric'
        });

        const total = vendasDoMes.reduce((acc, venda) => acc + parseFloat(venda.lucro), 0);
        totalMes.textContent = total.toFixed(2);

        vendasDoMes.forEach(venda => {
            const tr = document.createElement('tr');
            tr.innerHTML = gerarLinhaTabela(venda);
            tbody.appendChild(tr);
        });

        todasVendas.appendChild(clone);
    });
}
