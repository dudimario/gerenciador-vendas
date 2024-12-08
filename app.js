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

// Variáveis globais
let vendas = [];
let idiomaAtual = 'pt';

// Sistema de tradução
const traducoes = {
    pt: {
        titulo: "Gerenciador de Vendas de Assinaturas",
        novaVenda: "Nova Venda",
        produto: "Produto",
        duracao: "Duração",
        origem: "Origem do Produto",
        nomeComprador: "Nome do Comprador",
        email: "Email",
        dataCompra: "Data da Compra",
        dataVencimento: "Data de Vencimento",
        precoCusto: "Preço de Custo",
        precoVenda: "Preço de Venda",
        lucro: "Lucro",
        status: "Status",
        pago: "Pago",
        pendente: "Pendente",
        anotacoes: "Anotações",
        buscar: "Buscar",
        exportar: "Exportar para Excel",
        compartilhar: "Compartilhar",
        atualizar: "Atualizar Venda",
        emailEnviado: "Email enviado com sucesso!",
        erroEmail: "Erro ao enviar email",
        detalhesVenda: "Detalhes da Venda",
        produtosPersonalizados: "Produtos Personalizados"
    },
    he: {
        titulo: "מנהל מכירות מנויים",
        novaVenda: "מכירה חדשה",
        produto: "מוצר",
        duracao: "תקופה",
        origem: "מקור המוצר",
        nomeComprador: "שם הקונה",
        email: "אימייל",
        dataCompra: "תאריך קנייה",
        dataVencimento: "תאריך תפוגה",
        precoCusto: "מחיר עלות",
        precoVenda: "מחיר מכירה",
        lucro: "רווח",
        status: "סטטוס",
        pago: "שולם",
        pendente: "ממתין",
        anotacoes: "הערות",
        buscar: "חיפוש",
        exportar: "ייצוא לאקסל",
        compartilhar: "שיתוף",
        atualizar: "עדכן מכירה",
        emailEnviado: "האימייל נשלח בהצלחה!",
        erroEmail: "שגיאה בשליחת האימייל",
        detalhesVenda: "פרטי המכירה",
        produtosPersonalizados: "מוצרים מותאמים אישית"
    }
};

// Teste de conexão
console.log('Testando conexão com Firebase...');
db.collection('vendas').get()
    .then(snapshot => {
        console.log('Conexão com Firebase OK!');
        console.log('Número de vendas:', snapshot.size);
        carregarVendas(); // Carregar vendas após confirmar conexão
    })
    .catch(error => {
        console.error('Erro na conexão com Firebase:', error);
        alert('Erro ao conectar com o banco de dados. Verifique sua conexão.');
    });
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
        
        console.log('Data calculada:', {
            dataCompra,
            duracaoProduto,
            dataVencimento: dataVencimento.value
        });
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
        console.log('Iniciando carregamento de vendas...');
        const snapshot = await db.collection('vendas').get();
        
        // Limpar array atual
        vendas = [];
        
        // Mapear documentos
        snapshot.forEach(doc => {
            vendas.push({
                id: doc.id,
                ...doc.data()
            });
        });

        console.log('Vendas carregadas:', vendas.length);
        
        // Atualizar interface
        updateDebugInfo();
        atualizarTabela();
        
        return true;
    } catch (error) {
        console.error('Erro ao carregar vendas:', error);
        alert('Erro ao carregar banco de dados: ' + error.message);
        return false;
    }
}

async function salvarVenda(venda) {
    try {
        console.log('Iniciando salvamento da venda:', venda);
        const docRef = await db.collection('vendas').add(venda);
        console.log('Venda salva com ID:', docRef.id);
        await carregarVendas(); // Recarregar vendas após salvar
        return true;
    } catch (error) {
        console.error('Erro ao salvar venda:', error);
        alert('Erro ao salvar venda: ' + error.message);
        return false;
    }
}

async function excluirVenda(id, mostrarConfirmacao = true) {
    if (mostrarConfirmacao && !confirm('Tem certeza que deseja excluir esta venda?')) return;

    try {
        console.log('Excluindo venda:', id);
        await db.collection('vendas').doc(id).delete();
        console.log('Venda excluída com sucesso');
        await carregarVendas(); // Recarregar vendas após excluir
        if (mostrarConfirmacao) {
            alert('Venda excluída com sucesso!');
        }
        return true;
    } catch (error) {
        console.error('Erro ao excluir venda:', error);
        if (mostrarConfirmacao) {
            alert('Erro ao excluir venda: ' + error.message);
        }
        return false;
    }
}
// Função para gerar linha da tabela
function gerarLinhaTabela(venda) {
    return `
        <td>
            <input type="checkbox" class="form-check-input selecao-venda" data-id="${venda.id}">
        </td>
        <td>
            ${venda.produto}
            ${venda.origemProduto ? `<br><small class="text-muted"><strong>Origem</strong>: ${venda.origemProduto}</small>` : ''}
            ${venda.numeroSerial ? `<br><small class="text-muted"><strong>Serial</strong>: ${venda.numeroSerial}</small>` : ''}
        </td>
        <td>
            ${venda.nomeComprador}
            ${venda.email ? `<br><small class="text-muted"><i class="bi bi-envelope"></i> ${venda.email}</small>` : ''}
            ${venda.telefoneComprador ? `<br><small class="text-muted"><i class="bi bi-telephone"></i> ${venda.telefoneComprador}</small>` : ''}
        </td>
        <td>${new Date(venda.dataCompra).toLocaleDateString()}</td>
        <td>${new Date(venda.dataVencimento).toLocaleDateString()}</td>
        <td>
            ${venda.comprovante ? 
                `<button class="btn btn-info btn-sm" onclick="visualizarComprovante('${venda.id}')">
                    <i class="bi bi-image"></i> Ver
                </button>` : 
                'N/A'}
        </td>
        <td class="valor-custo currency">${venda.precoCusto ? parseFloat(venda.precoCusto).toFixed(2) : '0.00'}</td>
        <td class="valor-venda currency">${parseFloat(venda.precoVenda).toFixed(2)}</td>
        <td class="valor-lucro currency">${parseFloat(venda.lucro).toFixed(2)}</td>
        <td>
            <span class="badge ${venda.statusPagamento === 'pago' ? 'bg-success' : 'bg-warning'}">
                ${venda.statusPagamento === 'pago' ? traducoes[idiomaAtual].pago : traducoes[idiomaAtual].pendente}
            </span>
            ${venda.anotacoes ? 
                `<br><small class="text-muted anotacao-preview">
                    <i class="bi bi-sticky"></i> ${venda.anotacoes}
                </small>` : 
                ''}
        </td>
        <td>
            <div class="btn-group">
                <button class="btn btn-primary btn-sm" onclick="editarVenda('${venda.id}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="excluirVenda('${venda.id}')">
                    <i class="bi bi-trash"></i>
                </button>
                <button class="btn btn-success btn-sm" onclick="enviarEmail('${venda.id}')">
                    <i class="bi bi-envelope"></i>
                </button>
                <button class="btn btn-info btn-sm" onclick="abrirCompartilhar('${venda.id}')">
                    <i class="bi bi-share"></i>
                </button>
            </div>
        </td>
    `;
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
    if (!todasVendas) {
        console.error('Elemento todasVendas não encontrado');
        return;
    }
    
    todasVendas.innerHTML = '';
    if (!vendas.length) {
        console.log('Nenhuma venda para exibir');
        return;
    }

    console.log('Atualizando tabela com', vendas.length, 'vendas');

    const vendasPorMes = {};
    vendas.sort((a, b) => new Date(b.dataCompra) - new Date(a.dataCompra))
          .forEach(venda => {
              const mesAno = venda.dataCompra.substring(0, 7);
              if (!vendasPorMes[mesAno]) vendasPorMes[mesAno] = [];
              vendasPorMes[mesAno].push(venda);
          });

    Object.entries(vendasPorMes).forEach(([mesAno, vendasDoMes]) => {
        const template = document.getElementById('templateGrupoMes');
        if (!template) {
            console.error('Template não encontrado');
            return;
        }

        const clone = template.content.cloneNode(true);
        const mesAnoElement = clone.querySelector('.mes-ano');
        const totalMes = clone.querySelector('.total-mes');
        const tbody = clone.querySelector('.vendas-mes');

        const [ano, mes] = mesAno.split('-');
        const data = new Date(ano, mes - 1);
        try {
            mesAnoElement.textContent = data.toLocaleDateString(
                idiomaAtual === 'he' ? 'he-IL' : 'pt-BR',
                { month: 'long', year: 'numeric' }
            );
        } catch (error) {
            console.error('Erro ao formatar data:', error);
            mesAnoElement.textContent = `${mes}/${ano}`;
        }

        const total = vendasDoMes.reduce((acc, venda) => acc + parseFloat(venda.lucro), 0);
        totalMes.textContent = total.toFixed(2);

        vendasDoMes.forEach(venda => {
            const tr = document.createElement('tr');
            tr.innerHTML = gerarLinhaTabela(venda);
            tbody.appendChild(tr);
        });

        todasVendas.appendChild(clone);
    });

    console.log('Tabela atualizada com sucesso');
}
// Funções de ação
function editarVenda(id) {
    const venda = vendas.find(v => v.id === id);
    if (!venda) return;

    // Preencher formulário
    document.getElementById('nomeProduto').value = venda.produto;
    document.getElementById('origemProduto').value = venda.origemProduto;
    document.getElementById('numeroSerial').value = venda.numeroSerial || '';
    document.getElementById('nomeComprador').value = venda.nomeComprador;
    document.getElementById('emailComprador').value = venda.email || '';
    document.getElementById('telefoneComprador').value = venda.telefoneComprador || '';
    document.getElementById('dataCompra').value = venda.dataCompra;
    document.getElementById('dataVencimento').value = venda.dataVencimento;
    document.getElementById('precoCusto').value = venda.precoCusto || '';
    document.getElementById('precoVenda').value = venda.precoVenda;
    document.getElementById('lucro').value = venda.lucro;
    document.getElementById('statusPagamento').value = venda.statusPagamento;
    document.getElementById('anotacoes').value = venda.anotacoes || '';

    // Rolar até o formulário
    document.getElementById('vendaForm').scrollIntoView({ behavior: 'smooth' });

    // Marcar formulário como modo edição
    const form = document.getElementById('vendaForm');
    form.dataset.editMode = 'true';
    form.dataset.editId = id;

    // Mudar texto do botão
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = traducoes[idiomaAtual].atualizar || 'Atualizar Venda';
}

function enviarEmail(id) {
    const venda = vendas.find(v => v.id === id);
    if (!venda) return;

    enviarEmailNovaVenda(venda)
        .then(() => alert(traducoes[idiomaAtual].emailEnviado || 'Email enviado com sucesso!'))
        .catch(error => {
            console.error('Erro ao enviar email:', error);
            alert(traducoes[idiomaAtual].erroEmail || 'Erro ao enviar email');
        });
}

// Função para enviar email de nova venda
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
        console.log('Email enviado com sucesso');
    } catch (error) {
        console.error('Erro ao enviar email:', error);
        throw error;
    }
}

function abrirCompartilhar(id) {
    const venda = vendas.find(v => v.id === id);
    if (!venda) return;

    const modal = new bootstrap.Modal(document.getElementById('compartilharModal'), {
        backdrop: true,
        keyboard: true
    });
    
    const compartilharBtns = document.querySelector('.compartilhar-btns');
    if (compartilharBtns) {
        compartilharBtns.dataset.vendaId = id;
    }
    modal.show();
}

function compartilharVenda(tipo) {
    const btns = document.querySelector('.compartilhar-btns');
    const id = btns?.dataset.vendaId;
    const venda = vendas.find(v => v.id === id);
    if (!venda) return;

    const texto = `
        ${traducoes[idiomaAtual].produto || 'Produto'}: ${venda.produto}
        ${traducoes[idiomaAtual].valor || 'Valor'}: ₪${venda.precoVenda}
        ${traducoes[idiomaAtual].data || 'Data'}: ${new Date(venda.dataCompra).toLocaleDateString()}
        ${venda.numeroSerial ? `\n${traducoes[idiomaAtual].serial || 'Serial'}: ${venda.numeroSerial}` : ''}
        ${venda.anotacoes ? `\n${traducoes[idiomaAtual].anotacoes || 'Anotações'}: ${venda.anotacoes}` : ''}
    `.trim();

    if (tipo === 'whatsapp') {
        window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`);
    } else if (tipo === 'email') {
        window.open(`mailto:?subject=${encodeURIComponent(traducoes[idiomaAtual].detalhesVenda || 'Detalhes da Venda')}&body=${encodeURIComponent(texto)}`);
    }

    bootstrap.Modal.getInstance(document.getElementById('compartilharModal')).hide();
}

function visualizarComprovante(id) {
    const venda = vendas.find(v => v.id === id);
    if (!venda || !venda.comprovante) return;

    const img = document.getElementById('comprovanteImg');
    if (img) {
        img.src = venda.comprovante;
        new bootstrap.Modal(document.getElementById('comprovanteModal'), {
            backdrop: true,
            keyboard: true
        }).show();
    }
}
// Funções de configuração e balanço
function abrirConfiguracoes() {
    const configModalEl = document.getElementById('configModal');
    if (!configModalEl) return;
    
    const configModal = new bootstrap.Modal(configModalEl, {
        backdrop: true,
        keyboard: true,
        focus: true
    });
    
    carregarProdutos();
    configModal.show();
}

function carregarProdutos() {
    const listaProdutos = document.getElementById('listaProdutos');
    if (!listaProdutos) return;
    
    listaProdutos.innerHTML = '';
    const produtos = JSON.parse(localStorage.getItem('produtos') || '[]');
    
    produtos.forEach(produto => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `
            ${produto}
            <button class="btn btn-danger btn-sm" onclick="removerProduto('${produto}')">
                <i class="bi bi-trash"></i>
            </button>
        `;
        listaProdutos.appendChild(li);
    });
}

function adicionarProduto() {
    const novoProduto = document.getElementById('novoProduto');
    const produto = novoProduto.value.trim();
    
    if (!produto) return;
    
    const produtos = JSON.parse(localStorage.getItem('produtos') || '[]');
    if (!produtos.includes(produto)) {
        produtos.push(produto);
        localStorage.setItem('produtos', JSON.stringify(produtos));
        carregarProdutos();
        atualizarSelectProdutos();
    }
    
    novoProduto.value = '';
}

function removerProduto(produto) {
    let produtos = JSON.parse(localStorage.getItem('produtos') || '[]');
    produtos = produtos.filter(p => p !== produto);
    localStorage.setItem('produtos', JSON.stringify(produtos));
    carregarProdutos();
    atualizarSelectProdutos();
}

function atualizarSelectProdutos() {
    const select = document.getElementById('nomeProduto');
    const produtosPersonalizados = JSON.parse(localStorage.getItem('produtos') || '[]');
    
    // Manter as opções padrão até o último optgroup
    const optgroups = select.getElementsByTagName('optgroup');
    const ultimoOptgroup = optgroups[optgroups.length - 1];
    const indexUltimoOptgroup = Array.from(select.children).indexOf(ultimoOptgroup);
    
    // Remover opções personalizadas antigas
    while (select.children.length > indexUltimoOptgroup + 2) {
        select.removeChild(select.lastChild);
    }
    
    // Adicionar novo optgroup para produtos personalizados
    if (produtosPersonalizados.length > 0) {
        const grupo = document.createElement('optgroup');
        grupo.label = traducoes[idiomaAtual].produtosPersonalizados || 'Produtos Personalizados';
        
        produtosPersonalizados.forEach(produto => {
            const option = document.createElement('option');
            option.value = produto;
            option.textContent = produto;
            grupo.appendChild(option);
        });
        
        select.insertBefore(grupo, select.lastChild);
    }
}

function abrirBalanco() {
    const modal = new bootstrap.Modal(document.getElementById('balancoModal'), {
        backdrop: true,
        keyboard: true
    });
    
    // Calcular totais
    const totalVendas = vendas.length;
    const custoTotal = vendas.reduce((acc, v) => acc + (parseFloat(v.precoCusto) || 0), 0);
    const vendaTotal = vendas.reduce((acc, v) => acc + parseFloat(v.precoVenda), 0);
    const lucroTotal = vendas.reduce((acc, v) => acc + parseFloat(v.lucro), 0);

    // Status dos pagamentos
    const vendasPagas = vendas.filter(v => v.statusPagamento === 'pago');
    const vendasPendentes = vendas.filter(v => v.statusPagamento === 'pendente');
    const valorPago = vendasPagas.reduce((acc, v) => acc + parseFloat(v.precoVenda), 0);
    const valorPendente = vendasPendentes.reduce((acc, v) => acc + parseFloat(v.precoVenda), 0);

    // Atualizar elementos
    document.getElementById('balancoTotalVendas').textContent = totalVendas;
    document.getElementById('balancoCustoTotal').textContent = custoTotal.toFixed(2);
    document.getElementById('balancoVendaTotal').textContent = vendaTotal.toFixed(2);
    document.getElementById('balancoLucroTotal').textContent = lucroTotal.toFixed(2);
    document.getElementById('balancoVendasPagas').textContent = vendasPagas.length;
    document.getElementById('balancoVendasPendentes').textContent = vendasPendentes.length;
    document.getElementById('balancoValorPago').textContent = valorPago.toFixed(2);
    document.getElementById('balancoValorPendente').textContent = valorPendente.toFixed(2);

    modal.show();
}
// Funções de utilidade
function exportarParaExcel() {
    try {
        const headers = [
            'Produto', 'Origem', 'Serial', 'Nome', 'Email', 'Telefone',
            'Data Compra', 'Vencimento', 'Custo', 'Venda', 'Lucro', 'Status', 'Anotações'
        ];

        const dados = vendas.map(venda => [
            venda.produto,
            venda.origemProduto || '',
            venda.numeroSerial || '',
            venda.nomeComprador,
            venda.email || '',
            venda.telefoneComprador || '',
            new Date(venda.dataCompra).toLocaleDateString(),
            new Date(venda.dataVencimento).toLocaleDateString(),
            venda.precoCusto || '0',
            venda.precoVenda,
            venda.lucro,
            venda.statusPagamento,
            venda.anotacoes || ''
        ]);

        const csvContent = [headers, ...dados]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `vendas_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert('Arquivo exportado com sucesso!');
    } catch (error) {
        console.error('Erro ao exportar:', error);
        alert('Erro ao exportar arquivo');
    }
}

function toggleDebug() {
    const debugInfo = document.getElementById('debugInfo');
    debugInfo.style.display = debugInfo.style.display === 'none' ? 'block' : 'none';
    updateDebugInfo();
}

function limparBancoDados() {
    if (!confirm('Tem certeza que deseja limpar todo o banco de dados?')) return;

    const batch = db.batch();
    vendas.forEach(venda => {
        const ref = db.collection('vendas').doc(venda.id);
        batch.delete(ref);
    });

    batch.commit()
        .then(() => {
            vendas = [];
            atualizarTabela();
            alert('Banco de dados limpo com sucesso!');
        })
        .catch(error => {
            console.error('Erro ao limpar banco:', error);
            alert('Erro ao limpar banco de dados');
        });
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando aplicação...');

    // Event listeners para cálculos automáticos
    document.getElementById('dataCompra')?.addEventListener('change', calcularDataVencimento);
    document.getElementById('duracaoProduto')?.addEventListener('change', function() {
        const duracaoPersonalizada = document.getElementById('duracaoPersonalizada');
        if (duracaoPersonalizada) {
            duracaoPersonalizada.style.display = this.value === 'custom' ? 'block' : 'none';
        }
        calcularDataVencimento();
    });
    document.getElementById('duracaoPersonalizada')?.addEventListener('input', calcularDataVencimento);
    document.getElementById('precoVenda')?.addEventListener('input', calcularLucro);
    document.getElementById('precoCusto')?.addEventListener('input', calcularLucro);

    // Event listener do formulário
    document.getElementById('vendaForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            const loadingModalEl = document.getElementById('loadingModal');
            const loadingModal = new bootstrap.Modal(loadingModalEl);
            loadingModal.show();
            
            const venda = {
                produto: document.getElementById('nomeProduto').value === 'Outro' ? 
                         document.getElementById('outroNomeProduto').value : 
                         document.getElementById('nomeProduto').value,
                origemProduto: document.getElementById('origemProduto').value,
                numeroSerial: document.getElementById('numeroSerial').value,
                nomeComprador: document.getElementById('nomeComprador').value,
                email: document.getElementById('emailComprador').value,
                telefoneComprador: document.getElementById('telefoneComprador').value,
                dataCompra: document.getElementById('dataCompra').value,
                dataVencimento: document.getElementById('dataVencimento').value,
                precoCusto: document.getElementById('precoCusto').value || '0',
                precoVenda: document.getElementById('precoVenda').value,
                lucro: document.getElementById('lucro').value,
                statusPagamento: document.getElementById('statusPagamento').value,
                anotacoes: document.getElementById('anotacoes').value,
                dataCriacao: new Date().toISOString()
            };

            // Se estiver em modo edição, excluir venda antiga
            if (this.dataset.editMode === 'true') {
                await excluirVenda(this.dataset.editId, false);
                delete this.dataset.editMode;
                delete this.dataset.editId;
            }

            const comprovanteInput = document.getElementById('comprovante');
            if (comprovanteInput.files.length > 0) {
                const comprovante = await toBase64(comprovanteInput.files[0]);
                venda.comprovante = await comprimirImagem(comprovante);
            }

            if (await salvarVenda(venda)) {
                try {
                    await enviarEmailNovaVenda(venda);
                } catch (emailError) {
                    console.error('Erro ao enviar email:', emailError);
                }
                this.reset();
                alert('Venda salva com sucesso!');
            }

            loadingModal.hide();
        } catch (error) {
            console.error('Erro ao salvar venda:', error);
            alert('Erro ao salvar venda: ' + error.message);
            const loadingModal = bootstrap.Modal.getInstance(document.getElementById('loadingModal'));
            if (loadingModal) loadingModal.hide();
        }
    });

    // Inicializar tradução
    traduzirInterface();
});

// Tornar funções disponíveis globalmente
window.alternarIdioma = alternarIdioma;
window.toggleDebug = toggleDebug;
window.abrirBalanco = abrirBalanco;
window.abrirConfiguracoes = abrirConfiguracoes;
window.limparBancoDados = limparBancoDados;
window.exportarParaExcel = exportarParaExcel;
window.editarVenda = editarVenda;
window.excluirVenda = excluirVenda;
window.enviarEmail = enviarEmail;
window.abrirCompartilhar = abrirCompartilhar;
window.compartilharVenda = compartilharVenda;
window.visualizarComprovante = visualizarComprovante;
window.adicionarProduto = adicionarProduto;
window.removerProduto = removerProduto;
window.enviarEmailNovaVenda = enviarEmailNovaVenda;
