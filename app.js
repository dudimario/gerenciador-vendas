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
                ${venda.statusPagamento === 'pago' ? 'Pago' : 'Pendente'}
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

    // Event listener do formulário
    document.getElementById('vendaForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
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

            const comprovanteInput = document.getElementById('comprovante');
            if (comprovanteInput.files.length > 0) {
                const comprovante = await toBase64(comprovanteInput.files[0]);
                venda.comprovante = await comprimirImagem(comprovante);
            }

            if (await salvarVenda(venda)) {
                await enviarEmailNovaVenda(venda);
                await carregarVendas();
                this.reset();
                alert('Venda salva com sucesso!');
            }
        } catch (error) {
            console.error('Erro ao salvar venda:', error);
            alert('Erro ao salvar venda');
        } finally {
            loadingModal.hide();
        }
    });
});

// Funções auxiliares
async function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

async function comprimirImagem(base64Str) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            let width = img.width;
            let height = img.height;
            const maxSize = 800;
            
            if (width > height && width > maxSize) {
                height = height * (maxSize / width);
                width = maxSize;
            } else if (height > maxSize) {
                width = width * (maxSize / height);
                height = maxSize;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
    });
}

// Função para enviar email
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
        console.error('Erro ao enviar email:', error);
    }
}
