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
const db = firebase.firestore();

// Teste de conexão
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

// Função para calcular data de vencimento
function calcularDataVencimento() {
    const dataCompra = document.getElementById('dataCompra').value;
    const duracaoProduto = document.getElementById('duracaoProduto').value;
    const duracaoPersonalizada = document.getElementById('duracaoPersonalizada');
    const dataVencimento = document.getElementById('dataVencimento');
    
    if (!dataCompra || !duracaoProduto) {
        dataVencimento.value = '';
        return;
    }

    try {
        const dataInicial = new Date(dataCompra);
        const dataFinal = new Date(dataInicial);
        dataFinal.setHours(12, 0, 0, 0);
        
        if (duracaoProduto === 'forever') {
            dataFinal.setFullYear(2099, 11, 31);
        } else if (duracaoProduto === 'custom') {
            const meses = parseInt(duracaoPersonalizada.value) || 1;
            const diaAtual = dataFinal.getDate();
            dataFinal.setMonth(dataFinal.getMonth() + meses);
            if (dataFinal.getDate() !== diaAtual) {
                dataFinal.setDate(0);
            }
        } else {
            const meses = parseInt(duracaoProduto);
            const diaAtual = dataFinal.getDate();
            dataFinal.setMonth(dataFinal.getMonth() + meses);
            if (dataFinal.getDate() !== diaAtual) {
                dataFinal.setDate(0);
            }
        }

        const ano = dataFinal.getFullYear();
        const mes = String(dataFinal.getMonth() + 1).padStart(2, '0');
        const dia = String(dataFinal.getDate()).padStart(2, '0');
        dataVencimento.value = `${ano}-${mes}-${dia}`;
    } catch (error) {
        console.error('Erro ao calcular data de vencimento:', error);
        dataVencimento.value = '';
    }
}

// Função para calcular lucro
function calcularLucro() {
    const venda = parseFloat(document.getElementById('precoVenda').value) || 0;
    const custo = parseFloat(document.getElementById('precoCusto').value) || 0;
    document.getElementById('lucro').value = (venda - custo).toFixed(2);
}

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

    const vendasPorMes = {};
    vendas.sort((a, b) => new Date(b.dataCompra) - new Date(a.dataCompra))
          .forEach(venda => {
              const mesAno = venda.dataCompra.substring(0, 7);
              if (!vendasPorMes[mesAno]) vendasPorMes[mesAno] = [];
              vendasPorMes[mesAno].push(venda);
          });

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

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Carregar vendas iniciais
    carregarVendas();

    // Adicionar event listeners para cálculos automáticos
    document.getElementById('dataCompra').addEventListener('change', calcularDataVencimento);
    document.getElementById('duracaoProduto').addEventListener('change', function() {
        const duracaoPersonalizada = document.getElementById('duracaoPersonalizada');
        duracaoPersonalizada.style.display = this.value === 'custom' ? 'block' : 'none';
        calcularDataVencimento();
    });
    document.getElementById('duracaoPersonalizada').addEventListener('input', calcularDataVencimento);
    document.getElementById('precoVenda').addEventListener('input', calcularLucro);
    document.getElementById('precoCusto').addEventListener('input', calcularLucro);
});
