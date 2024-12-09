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
const auth = firebase.auth();
const storage = firebase.storage();

// Configurações globais
const CONFIG = {
    ITEMS_PER_PAGE: 10,
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    AUTO_BACKUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 horas
    ALERT_DAYS_BEFORE: [30, 15, 7, 1], // Dias para alertar antes do vencimento
    SUPPORTED_EXPORT_FORMATS: ['csv', 'xlsx', 'pdf'],
    DEFAULT_CURRENCY: '₪',
    DATE_FORMAT: 'DD/MM/YYYY',
    CHART_COLORS: {
        primary: '#0d6efd',
        success: '#28a745',
        danger: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    }
};

// Variáveis globais
let vendas = [];
let idiomaAtual = 'pt';
let usuarioAtual = null;
let configuracoesUsuario = {};
let backupPendente = false;

// Classes
class Venda {
    constructor(data = {}) {
        this.id = data.id || Date.now().toString();
        this.produto = data.produto || '';
        this.origemProduto = data.origemProduto || '';
        this.numeroSerial = data.numeroSerial || '';
        this.nomeComprador = data.nomeComprador || '';
        this.email = data.email || '';
        this.telefoneComprador = data.telefoneComprador || '';
        this.dataCompra = data.dataCompra || new Date().toISOString().split('T')[0];
        this.dataVencimento = data.dataVencimento || '';
        this.precoCusto = parseFloat(data.precoCusto || 0).toFixed(2);
        this.precoVenda = parseFloat(data.precoVenda || 0).toFixed(2);
        this.lucro = parseFloat(data.lucro || 0).toFixed(2);
        this.statusPagamento = data.statusPagamento || 'pendente';
        this.anotacoes = data.anotacoes || '';
        this.comprovante = data.comprovante || null;
        this.dataCriacao = data.dataCriacao || new Date().toISOString();
        this.ultimaAtualizacao = new Date().toISOString();
        this.criadoPor = data.criadoPor || usuarioAtual?.uid || 'sistema';
        this.historicoAlteracoes = data.historicoAlteracoes || [];
    }

    async salvar() {
        try {
            if (this.comprovante && this.comprovante.startsWith('data:')) {
                const comprovanteComprimido = await comprimirImagem(this.comprovante);
                const ref = storage.ref(`comprovantes/${this.id}`);
                await ref.putString(comprovanteComprimido, 'data_url');
                this.comprovante = await ref.getDownloadURL();
            }

            const vendaData = { ...this };
            delete vendaData.id;

            if (await db.collection('vendas').doc(this.id).set(vendaData)) {
                await this.registrarAlteracao('criação');
                await this.enviarEmail('nova_venda');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao salvar venda:', error);
            throw error;
        }
    }

    async excluir() {
        try {
            if (this.comprovante) {
                await storage.refFromURL(this.comprovante).delete();
            }
            await db.collection('vendas').doc(this.id).delete();
            await this.registrarAlteracao('exclusão');
            return true;
        } catch (error) {
            console.error('Erro ao excluir venda:', error);
            throw error;
        }
    }

    async registrarAlteracao(tipo, detalhes = '') {
        const alteracao = {
            tipo,
            data: new Date().toISOString(),
            usuario: usuarioAtual?.email || 'sistema',
            detalhes
        };
        this.historicoAlteracoes.push(alteracao);
        
        if (this.id) {
            await db.collection('vendas').doc(this.id).update({
                historicoAlteracoes: this.historicoAlteracoes,
                ultimaAtualizacao: new Date().toISOString()
            });
        }
    }

    async enviarEmail(tipo) {
        try {
            const templateParams = {
                to_email: 'davidmeirshrem@gmail.com',
                to_name: this.nomeComprador,
                from_name: 'Sistema de Vendas',
                subject: traducoes[idiomaAtual][`email_${tipo}_subject`],
                message: this.gerarMensagemEmail(tipo)
            };

            await emailjs.send(
                'service_lb5yt39',
                'template_o0acrgq',
                templateParams,
                'hOEhCYJwa_99mn944'
            );

            await this.registrarAlteracao('email_enviado', `Tipo: ${tipo}`);
            return true;
        } catch (error) {
            console.error('Erro ao enviar email:', error);
            throw error;
        }
    }

    gerarMensagemEmail(tipo) {
        const formatarData = (data) => new Date(data).toLocaleDateString(
            idiomaAtual === 'he' ? 'he-IL' : 'pt-BR'
        );

        const mensagens = {
            nova_venda: `
                ${traducoes[idiomaAtual].novaVendaRegistrada}

                ${traducoes[idiomaAtual].produto}: ${this.produto}
                ${traducoes[idiomaAtual].origem}: ${this.origemProduto || 'N/A'}
                ${traducoes[idiomaAtual].serial}: ${this.numeroSerial || 'N/A'}
                ${traducoes[idiomaAtual].dataCompra}: ${formatarData(this.dataCompra)}
                ${traducoes[idiomaAtual].dataVencimento}: ${formatarData(this.dataVencimento)}
                ${traducoes[idiomaAtual].valor}: ${CONFIG.DEFAULT_CURRENCY}${this.precoVenda}
                ${traducoes[idiomaAtual].status}: ${this.statusPagamento}
                ${traducoes[idiomaAtual].anotacoes}: ${this.anotacoes || 'N/A'}
            `,
            vencimento_proximo: `
                ${traducoes[idiomaAtual].alertaVencimento}

                ${traducoes[idiomaAtual].produto}: ${this.produto}
                ${traducoes[idiomaAtual].cliente}: ${this.nomeComprador}
                ${traducoes[idiomaAtual].dataVencimento}: ${formatarData(this.dataVencimento)}
                ${traducoes[idiomaAtual].diasRestantes}: ${this.calcularDiasAteVencimento()}
            `
        };

        return mensagens[tipo]?.trim() || '';
    }

    calcularDiasAteVencimento() {
        const hoje = new Date();
        const vencimento = new Date(this.dataVencimento);
        const diffTime = vencimento - hoje;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    static async buscarTodas() {
        try {
            const snapshot = await db.collection('vendas').get();
            return snapshot.docs.map(doc => new Venda({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Erro ao buscar vendas:', error);
            throw error;
        }
    }

    static async buscarPorFiltros(filtros) {
        try {
            let query = db.collection('vendas');

            // Aplicar filtros
            if (filtros.produto) {
                query = query.where('produto', '==', filtros.produto);
            }
            if (filtros.status) {
                query = query.where('statusPagamento', '==', filtros.status);
            }
            if (filtros.dataInicio) {
                query = query.where('dataCompra', '>=', filtros.dataInicio);
            }
            if (filtros.dataFim) {
                query = query.where('dataCompra', '<=', filtros.dataFim);
            }

            const snapshot = await query.get();
            return snapshot.docs.map(doc => new Venda({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Erro ao buscar vendas com filtros:', error);
            throw error;
        }
    }
}

// Sistema de tradução completo
const traducoes = {
    pt: {
        // Interface geral
        titulo: "Gerenciador de Vendas de Assinaturas",
        novaVenda: "Nova Venda",
        editarVenda: "Editar Venda",
        configuracoes: "Configurações",
        balanco: "Balanço",
        relatorios: "Relatórios",
        usuarios: "Usuários",
        backup: "Backup",
        ajuda: "Ajuda",
        sair: "Sair",

        // Campos do formulário
        produto: "Produto",
        duracao: "Duração",
        origem: "Origem do Produto",
        nomeComprador: "Nome do Comprador",
        email: "Email",
        telefone: "Telefone",
        dataCompra: "Data da Compra",
        dataVencimento: "Data de Vencimento",
        precoCusto: "Preço de Custo",
        precoVenda: "Preço de Venda",
        lucro: "Lucro",
        status: "Status",
        anotacoes: "Anotações",
        comprovante: "Comprovante",

        // Status e mensagens
        pago: "Pago",
        pendente: "Pendente",
        vencido: "Vencido",
        ativo: "Ativo",
        cancelado: "Cancelado",
        carregando: "Carregando...",
        processando: "Processando...",
        salvando: "Salvando...",
        excluindo: "Excluindo...",
        exportando: "Exportando...",

        // Mensagens de sucesso
        vendaSalva: "Venda salva com sucesso!",
        vendaExcluida: "Venda excluída com sucesso!",
        emailEnviado: "Email enviado com sucesso!",
        backupConcluido: "Backup realizado com sucesso!",
        configuracoesSalvas: "Configurações salvas com sucesso!",

        // Mensagens de erro
        erroSalvar: "Erro ao salvar venda",
        erroExcluir: "Erro ao excluir venda",
        erroEmail: "Erro ao enviar email",
        erroBackup: "Erro ao realizar backup",
        erroCarregar: "Erro ao carregar dados",

        // Confirmações
        confirmarExclusao: "Tem certeza que deseja excluir esta venda?",
        confirmarSaida: "Tem certeza que deseja sair?",
        confirmarLimpar: "Tem certeza que deseja limpar todos os dados?",

        // Relatórios e balanço
        relatorioVendas: "Relatório de Vendas",
        relatorioFinanceiro: "Relatório Financeiro",
        relatorioClientes: "Relatório de Clientes",
        balancoMensal: "Balanço Mensal",
        balancoAnual: "Balanço Anual",
        totalVendas: "Total de Vendas",
        totalLucro: "Total de Lucro",
        mediaVendas: "Média de Vendas",
        mediaLucro: "Média de Lucro",

        // Gráficos
        graficoVendas: "Gráfico de Vendas",
        graficoLucro: "Gráfico de Lucro",
        graficoProdutos: "Gráfico de Produtos",
        graficoStatus: "Gráfico de Status",

        // Exportação
        exportarExcel: "Exportar para Excel",
        exportarPDF: "Exportar para PDF",
        exportarCSV: "Exportar para CSV",

        // Configurações
        configGerais: "Configurações Gerais",
        configEmail: "Configurações de Email",
        configBackup: "Configurações de Backup",
        configNotificacoes: "Configurações de Notificações",

        // Usuários
        novoUsuario: "Novo Usuário",
        editarUsuario: "Editar Usuário",
        perfilUsuario: "Perfil do Usuário",
        permissoes: "Permissões",

        // Campos adicionais
        buscar: "Buscar",
        filtrar: "Filtrar",
        ordenar: "Ordenar",
        periodo: "Período",
        categoria: "Categoria",
        detalhes: "Detalhes",
        historico: "Histórico",
        observacoes: "Observações"
    },
    he: {
        // Interface geral
        titulo: "מנהל מכירות מנויים",
        novaVenda: "מכירה חדשה",
        editarVenda: "עריכת מכירה",
        configuracoes: "הגדרות",
        balanco: "מאזן",
        relatorios: "דוחות",
        usuarios: "משתמשים",
        backup: "גיבוי",
        ajuda: "עזרה",
        sair: "יציאה",

        // Campos do formulário
        produto: "מוצר",
        duracao: "משך",
        origem: "מקור המוצר",
        nomeComprador: "שם הקונה",
        email: "דוא״ל",
        telefone: "טלפון",
        dataCompra: "תאריך קנייה",
        dataVencimento: "תאריך תפוגה",
        precoCusto: "מחיר עלות",
        precoVenda: "מחיר מכירה",
        lucro: "רווח",
        status: "סטטוס",
        anotacoes: "הערות",
        comprovante: "קבלה",

        // Status e mensagens
        pago: "שולם",
        pendente: "ממתין",
        vencido: "פג תוקף",
        ativo: "פעיל",
        cancelado: "מבוטל",
        carregando: "טוען...",
        processando: "מעבד...",
        salvando: "שומר...",
        excluindo: "מוחק...",
        exportando: "מייצא...",

        // Mensagens de sucesso
        vendaSalva: "המכירה נשמרה בהצלחה!",
        vendaExcluida: "המכירה נמחקה בהצלחה!",
        emailEnviado: "האימייל נשלח בהצלחה!",
        backupConcluido: "הגיבוי בוצע בהצלחה!",
        configuracoesSalvas: "ההגדרות נשמרו בהצלחה!",

        // Mensagens de erro
        erroSalvar: "שגיאה בשמירת המכירה",
        erroExcluir: "שגיאה במחיקת המכירה",
        erroEmail: "שגיאה בשליחת האימייל",
        erroBackup: "שגיאה בביצוע הגיבוי",
        erroCarregar: "שגיאה בטעינת הנתונים",

        // Confirmações
        confirmarExclusao: "האם אתה בטוח שברצונך למחוק מכירה זו?",
        confirmarSaida: "האם אתה בטוח שברצונך לצאת?",
        confirmarLimpar: "האם אתה בטוח שברצונך למחוק את כל הנתונים?",

        // Relatórios e balanço
        relatorioVendas: "דוח מכירות",
        relatorioFinanceiro: "דוח פיננסי",
        relatorioClientes: "דוח לקוחות",
        balancoMensal: "מאזן חודשי",
        balancoAnual: "מאזן שנתי",
        totalVendas: "סך המכירות",
        totalLucro: "סך הרווח",
        mediaVendas: "ממוצע מכירות",
        mediaLucro: "ממוצע רווח",

        // Gráficos
        graficoVendas: "גרף מכירות",
        graficoLucro: "גרף רווחים",
        graficoProdutos: "גרף מוצרים",
        graficoStatus: "גרף סטטוסים",

        // Exportação
        exportarExcel: "ייצוא לאקסל",
        exportarPDF: "PDF ייצוא ל",
        exportarCSV: "CSV ייצוא ל",

        // Configurações
        configGerais: "הגדרות כלליות",
        configEmail: "הגדרות דוא״ל",
        configBackup: "הגדרות גיבוי",
        configNotificacoes: "הגדרות התראות",

        // Usuários
        novoUsuario: "משתמש חדש",
        editarUsuario: "עריכת משתמש",
        perfilUsuario: "פרופיל משתמש",
        permissoes: "הרשאות",

        // Campos adicionais
        buscar: "חיפוש",
        filtrar: "סינון",
        ordenar: "מיון",
        periodo: "תקופה",
        categoria: "קטגוריה",
        detalhes: "פרטים",
        historico: "היסטוריה",
        observacoes: "הערות"
    }
};

// Funções de interface e manipulação de dados
class InterfaceManager {
    static atualizarTabela() {
        const todasVendas = document.getElementById('todasVendas');
        if (!todasVendas) return;
        
        todasVendas.innerHTML = '';
        if (!vendas.length) {
            todasVendas.innerHTML = `
                <div class="alert alert-info">
                    ${traducoes[idiomaAtual].nenhumaVenda}
                </div>
            `;
            return;
        }

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
            const grupoMes = this.criarGrupoMes(mesAno, vendasDoMes);
            todasVendas.appendChild(grupoMes);
        });

        this.atualizarGraficos();
        this.atualizarEstatisticas();
    }

    static criarGrupoMes(mesAno, vendas) {
        const template = document.getElementById('templateGrupoMes');
        const clone = template.content.cloneNode(true);
        
        const [ano, mes] = mesAno.split('-');
        const data = new Date(ano, mes - 1);
        
        // Cabeçalho do grupo
        clone.querySelector('.mes-ano').textContent = data.toLocaleDateString(
            idiomaAtual === 'he' ? 'he-IL' : 'pt-BR',
            { month: 'long', year: 'numeric' }
        );

        // Totais do mês
        const totais = this.calcularTotaisMes(vendas);
        clone.querySelector('.total-vendas').textContent = vendas.length;
        clone.querySelector('.total-lucro').textContent = totais.lucro.toFixed(2);
        clone.querySelector('.total-custo').textContent = totais.custo.toFixed(2);
        clone.querySelector('.total-venda').textContent = totais.venda.toFixed(2);

        // Tabela de vendas
        const tbody = clone.querySelector('.vendas-mes');
        vendas.forEach(venda => {
            const tr = document.createElement('tr');
            tr.innerHTML = this.gerarLinhaTabela(venda);
            tbody.appendChild(tr);
        });

        return clone;
    }

    static calcularTotaisMes(vendas) {
        return vendas.reduce((acc, venda) => ({
            lucro: acc.lucro + parseFloat(venda.lucro),
            custo: acc.custo + parseFloat(venda.precoCusto || 0),
            venda: acc.venda + parseFloat(venda.precoVenda)
        }), { lucro: 0, custo: 0, venda: 0 });
    }

    static gerarLinhaTabela(venda) {
        return `
            <td>
                <input type="checkbox" class="form-check-input selecao-venda" data-id="${venda.id}">
            </td>
            <td>
                ${venda.produto}
                ${venda.origemProduto ? `<br><small class="text-muted"><strong>${traducoes[idiomaAtual].origem}</strong>: ${venda.origemProduto}</small>` : ''}
                ${venda.numeroSerial ? `<br><small class="text-muted"><strong>${traducoes[idiomaAtual].serial}</strong>: ${venda.numeroSerial}</small>` : ''}
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
                        <i class="bi bi-image"></i> ${traducoes[idiomaAtual].ver}
                    </button>` : 
                    'N/A'}
            </td>
            <td class="valor-custo currency">${venda.precoCusto ? parseFloat(venda.precoCusto).toFixed(2) : '0.00'}</td>
            <td class="valor-venda currency">${parseFloat(venda.precoVenda).toFixed(2)}</td>
            <td class="valor-lucro currency">${parseFloat(venda.lucro).toFixed(2)}</td>
            <td>
                <span class="badge ${this.getStatusClass(venda.statusPagamento)}">
                    ${traducoes[idiomaAtual][venda.statusPagamento]}
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

    static getStatusClass(status) {
        const classes = {
            pago: 'bg-success',
            pendente: 'bg-warning',
            vencido: 'bg-danger',
            cancelado: 'bg-secondary'
        };
        return classes[status] || 'bg-secondary';
    }

    static atualizarGraficos() {
        // Implementar gráficos usando Chart.js
        this.atualizarGraficoVendas();
        this.atualizarGraficoLucros();
        this.atualizarGraficoProdutos();
        this.atualizarGraficoStatus();
    }

    static atualizarEstatisticas() {
        const stats = this.calcularEstatisticas();
        
        // Atualizar elementos na interface
        document.getElementById('totalVendas').textContent = stats.totalVendas;
        document.getElementById('totalLucro').textContent = stats.lucroTotal.toFixed(2);
        document.getElementById('mediaVendas').textContent = stats.mediaVendas.toFixed(2);
        document.getElementById('mediaLucro').textContent = stats.mediaLucro.toFixed(2);
        document.getElementById('melhorMes').textContent = stats.melhorMes;
        document.getElementById('produtoMaisVendido').textContent = stats.produtoMaisVendido;
    }

    static calcularEstatisticas() {
        // Implementar cálculos estatísticos
        return {
            totalVendas: vendas.length,
            lucroTotal: vendas.reduce((acc, v) => acc + parseFloat(v.lucro), 0),
            mediaVendas: vendas.length ? vendas.reduce((acc, v) => acc + parseFloat(v.precoVenda), 0) / vendas.length : 0,
            mediaLucro: vendas.length ? vendas.reduce((acc, v) => acc + parseFloat(v.lucro), 0) / vendas.length : 0,
            melhorMes: this.calcularMelhorMes(),
            produtoMaisVendido: this.calcularProdutoMaisVendido()
        };
    }

    static calcularMelhorMes() {
        // Implementar cálculo do melhor mês
        const vendasPorMes = {};
        vendas.forEach(venda => {
            const mesAno = venda.dataCompra.substring(0, 7);
            if (!vendasPorMes[mesAno]) {
                vendasPorMes[mesAno] = {
                    lucro: 0,
                    quantidade: 0
                };
            }
            vendasPorMes[mesAno].lucro += parseFloat(venda.lucro);
            vendasPorMes[mesAno].quantidade++;
        });

        let melhorMes = { mesAno: '', lucro: 0 };
        Object.entries(vendasPorMes).forEach(([mesAno, dados]) => {
            if (dados.lucro > melhorMes.lucro) {
                melhorMes = { mesAno, lucro: dados.lucro };
            }
        });

        if (!melhorMes.mesAno) return 'N/A';

        const [ano, mes] = melhorMes.mesAno.split('-');
        return new Date(ano, mes - 1).toLocaleDateString(
            idiomaAtual === 'he' ? 'he-IL' : 'pt-BR',
            { month: 'long', year: 'numeric' }
        );
    }

    static calcularProdutoMaisVendido() {
        // Implementar cálculo do produto mais vendido
        const produtosCount = {};
        vendas.forEach(venda => {
            produtosCount[venda.produto] = (produtosCount[venda.produto] || 0) + 1;
        });

        let produtoMaisVendido = { nome: '', quantidade: 0 };
        Object.entries(produtosCount).forEach(([produto, quantidade]) => {
            if (quantidade > produtoMaisVendido.quantidade) {
                produtoMaisVendido = { nome: produto, quantidade };
            }
        });

        return produtoMaisVendido.nome || 'N/A';
    }
}
// Sistema de Backup e Restauração
class BackupManager {
    static async realizarBackup() {
        try {
            const dados = {
                vendas,
                configuracoes: this.getConfiguracoes(),
                timestamp: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(dados)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `backup_vendas_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            return true;
        } catch (error) {
            console.error('Erro ao realizar backup:', error);
            throw error;
        }
    }

    static async restaurarBackup(arquivo) {
        try {
            const texto = await arquivo.text();
            const dados = JSON.parse(texto);

            if (!this.validarBackup(dados)) {
                throw new Error('Arquivo de backup inválido');
            }

            vendas = dados.vendas;
            this.setConfiguracoes(dados.configuracoes);
            
            await this.salvarDados();
            return true;
        } catch (error) {
            console.error('Erro ao restaurar backup:', error);
            throw error;
        }
    }

    static validarBackup(dados) {
        return dados && 
               Array.isArray(dados.vendas) && 
               dados.configuracoes &&
               dados.timestamp;
    }

    static getConfiguracoes() {
        return {
            produtos: JSON.parse(localStorage.getItem('produtos') || '[]'),
            idioma: idiomaAtual,
            emailPadrao: localStorage.getItem('emailPadrao'),
            configuracoesUsuario: configuracoesUsuario
        };
    }

    static setConfiguracoes(config) {
        localStorage.setItem('produtos', JSON.stringify(config.produtos || []));
        idiomaAtual = config.idioma || 'pt';
        localStorage.setItem('emailPadrao', config.emailPadrao || '');
        configuracoesUsuario = config.configuracoesUsuario || {};
    }

    static async salvarDados() {
        localStorage.setItem('vendas', JSON.stringify(vendas));
        atualizarTabela();
        atualizarGraficos();
        return true;
    }

    static agendarBackupAutomatico() {
        setInterval(async () => {
            if (backupPendente) {
                try {
                    await this.realizarBackup();
                    backupPendente = false;
                    console.log('Backup automático realizado com sucesso');
                } catch (error) {
                    console.error('Erro no backup automático:', error);
                }
            }
        }, CONFIG.AUTO_BACKUP_INTERVAL);
    }
}

// Sistema de Relatórios
class RelatoriosManager {
    static gerarRelatorioVendas(filtros = {}) {
        let vendasFiltradas = [...vendas];

        // Aplicar filtros
        if (filtros.dataInicio) {
            vendasFiltradas = vendasFiltradas.filter(v => 
                new Date(v.dataCompra) >= new Date(filtros.dataInicio)
            );
        }
        if (filtros.dataFim) {
            vendasFiltradas = vendasFiltradas.filter(v => 
                new Date(v.dataCompra) <= new Date(filtros.dataFim)
            );
        }
        if (filtros.produto) {
            vendasFiltradas = vendasFiltradas.filter(v => 
                v.produto.toLowerCase().includes(filtros.produto.toLowerCase())
            );
        }
        if (filtros.status) {
            vendasFiltradas = vendasFiltradas.filter(v => 
                v.statusPagamento === filtros.status
            );
        }

        // Calcular totais
        const totais = {
            quantidade: vendasFiltradas.length,
            custoTotal: vendasFiltradas.reduce((acc, v) => acc + (parseFloat(v.precoCusto) || 0), 0),
            vendaTotal: vendasFiltradas.reduce((acc, v) => acc + parseFloat(v.precoVenda), 0),
            lucroTotal: vendasFiltradas.reduce((acc, v) => acc + parseFloat(v.lucro), 0)
        };

        // Agrupar por período
        const vendasPorPeriodo = this.agruparPorPeriodo(vendasFiltradas, filtros.agrupamento || 'mes');

        return {
            vendas: vendasFiltradas,
            totais,
            vendasPorPeriodo,
            filtrosAplicados: filtros,
            dataGeracao: new Date().toISOString()
        };
    }

    static agruparPorPeriodo(vendas, periodo) {
        const grupos = {};
        
        vendas.forEach(venda => {
            const data = new Date(venda.dataCompra);
            let chave;

            switch(periodo) {
                case 'dia':
                    chave = data.toISOString().split('T')[0];
                    break;
                case 'mes':
                    chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
                    break;
                case 'ano':
                    chave = data.getFullYear().toString();
                    break;
                default:
                    chave = 'total';
            }

            if (!grupos[chave]) {
                grupos[chave] = {
                    vendas: [],
                    quantidade: 0,
                    custoTotal: 0,
                    vendaTotal: 0,
                    lucroTotal: 0
                };
            }

            grupos[chave].vendas.push(venda);
            grupos[chave].quantidade++;
            grupos[chave].custoTotal += parseFloat(venda.precoCusto) || 0;
            grupos[chave].vendaTotal += parseFloat(venda.precoVenda);
            grupos[chave].lucroTotal += parseFloat(venda.lucro);
        });

        return grupos;
    }

    static exportarRelatorio(relatorio, formato) {
        switch(formato.toLowerCase()) {
            case 'excel':
                return this.exportarExcel(relatorio);
            case 'pdf':
                return this.exportarPDF(relatorio);
            case 'csv':
                return this.exportarCSV(relatorio);
            default:
                throw new Error('Formato não suportado');
        }
    }

    static exportarExcel(relatorio) {
        // Implementar exportação para Excel
        const headers = [
            'Produto',
            'Origem',
            'Serial',
            'Nome',
            'Email',
            'Telefone',
            'Data Compra',
            'Vencimento',
            'Custo (₪)',
            'Venda (₪)',
            'Lucro (₪)',
            'Status',
            'Anotações'
        ];

        const dados = relatorio.vendas.map(venda => [
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

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dados]);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendas');
        
        // Adicionar aba de resumo
        const resumoHeaders = ['Métrica', 'Valor'];
        const resumoDados = [
            ['Total de Vendas', relatorio.totais.quantidade],
            ['Custo Total', relatorio.totais.custoTotal],
            ['Venda Total', relatorio.totais.vendaTotal],
            ['Lucro Total', relatorio.totais.lucroTotal]
        ];
        
        const resumoWorksheet = XLSX.utils.aoa_to_sheet([resumoHeaders, ...resumoDados]);
        XLSX.utils.book_append_sheet(workbook, resumoWorksheet, 'Resumo');

        XLSX.writeFile(workbook, `relatorio_vendas_${new Date().toLocaleDateString()}.xlsx`);
    }

    static exportarPDF(relatorio) {
        // Implementar exportação para PDF usando jsPDF
        const doc = new jsPDF();
        
        // Adicionar cabeçalho
        doc.setFontSize(18);
        doc.text('Relatório de Vendas', 14, 20);
        
        // Adicionar informações do relatório
        doc.setFontSize(12);
        doc.text(`Data de Geração: ${new Date().toLocaleDateString()}`, 14, 30);
        doc.text(`Total de Vendas: ${relatorio.totais.quantidade}`, 14, 40);
        doc.text(`Lucro Total: ₪${relatorio.totais.lucroTotal.toFixed(2)}`, 14, 50);
        
        // Adicionar tabela de vendas
        const headers = [
            ['Produto', 'Cliente', 'Data', 'Valor', 'Status']
        ];
        
        const dados = relatorio.vendas.map(venda => [
            venda.produto,
            venda.nomeComprador,
            new Date(venda.dataCompra).toLocaleDateString(),
            `₪${venda.precoVenda}`,
            venda.statusPagamento
        ]);
        
        doc.autoTable({
            head: headers,
            body: dados,
            startY: 60,
            theme: 'grid'
        });
        
        doc.save(`relatorio_vendas_${new Date().toLocaleDateString()}.pdf`);
    }

    static exportarCSV(relatorio) {
        // Implementar exportação para CSV
        const headers = [
            'Produto',
            'Origem',
            'Serial',
            'Nome',
            'Email',
            'Telefone',
            'Data Compra',
            'Vencimento',
            'Custo (₪)',
            'Venda (₪)',
            'Lucro (₪)',
            'Status',
            'Anotações'
        ];

        const dados = relatorio.vendas.map(venda => [
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
        link.setAttribute('download', `relatorio_vendas_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Sistema de Notificações
class NotificacoesManager {
    static async enviarNotificacao(tipo, dados) {
        try {
            const template = this.getTemplate(tipo, dados);
            
            if (!template) {
                throw new Error('Template de notificação não encontrado');
            }

            await emailjs.send(
                'service_lb5yt39',
                'template_o0acrgq',
                template,
                'hOEhCYJwa_99mn944'
            );

            return true;
        } catch (error) {
            console.error('Erro ao enviar notificação:', error);
            throw error;
        }
    }

    static getTemplate(tipo, dados) {
        const templates = {
            nova_venda: {
                to_email: 'davidmeirshrem@gmail.com',
                to_name: dados.nomeComprador,
                from_name: 'Sistema de Vendas',
                subject: traducoes[idiomaAtual].novaVendaRegistrada,
                message: `
                    ${traducoes[idiomaAtual].novaVendaRegistrada}

                    ${traducoes[idiomaAtual].produto}: ${dados.produto}
                    ${traducoes[idiomaAtual].origem}: ${dados.origemProduto || 'N/A'}
                    ${traducoes[idiomaAtual].serial}: ${dados.numeroSerial || 'N/A'}
                    ${traducoes[idiomaAtual].dataCompra}: ${new Date(dados.dataCompra).toLocaleDateString()}
                    ${traducoes[idiomaAtual].dataVencimento}: ${new Date(dados.dataVencimento).toLocaleDateString()}
                    ${traducoes[idiomaAtual].valor}: ₪${dados.precoVenda}
                    ${traducoes[idiomaAtual].status}: ${dados.statusPagamento}
                    ${traducoes[idiomaAtual].anotacoes}: ${dados.anotacoes || 'N/A'}
                `.trim()
            },
            vencimento_proximo: {
                to_email: 'davidmeirshrem@gmail.com',
                to_name: dados.nomeComprador,
                from_name: 'Sistema de Vendas',
                subject: traducoes[idiomaAtual].alertaVencimento,
                message: `
                    ${traducoes[idiomaAtual].alertaVencimento}

                    ${traducoes[idiomaAtual].produto}: ${dados.produto}
                    ${traducoes[idiomaAtual].cliente}: ${dados.nomeComprador}
                    ${traducoes[idiomaAtual].dataVencimento}: ${new Date(dados.dataVencimento).toLocaleDateString()}
                    ${traducoes[idiomaAtual].diasRestantes}: ${dados.diasRestantes}
                `.trim()
            },
            backup_realizado: {
                to_email: 'davidmeirshrem@gmail.com',
                to_name: 'Administrador',
                from_name: 'Sistema de Vendas',
                subject: traducoes[idiomaAtual].backupRealizado,
                message: `
                    ${traducoes[idiomaAtual].backupRealizadoMensagem}
                    ${traducoes[idiomaAtual].data}: ${new Date().toLocaleString()}
                    ${traducoes[idiomaAtual].totalVendas}: ${dados.totalVendas}
                `.trim()
            }
        };

        return templates[tipo];
    }

    static verificarVencimentos() {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        vendas.forEach(venda => {
            const dataVencimento = new Date(venda.dataVencimento);
            dataVencimento.setHours(0, 0, 0, 0);

            const diffDias = Math.floor((dataVencimento - hoje) / (1000 * 60 * 60 * 24));

            if (CONFIG.ALERT_DAYS_BEFORE.includes(diffDias)) {
                this.enviarNotificacao('vencimento_proximo', {
                    ...venda,
                    diasRestantes: diffDias
                }).catch(error => {
                    console.error('Erro ao enviar notificação de vencimento:', error);
                });
            }
        });
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando aplicação...');

    // Carregar dados
    carregarVendas();

    // Inicializar interface
    InterfaceManager.atualizarTabela();
    
    // Configurar verificação de vencimentos
    setInterval(() => {
        NotificacoesManager.verificarVencimentos();
    }, 24 * 60 * 60 * 1000);

    // Configurar backup automático
    BackupManager.agendarBackupAutomatico();

    // Event listeners
    document.getElementById('vendaForm').addEventListener('submit', handleSubmitVenda);
    document.getElementById('btnBuscar').addEventListener('click', realizarBusca);
    document.getElementById('buscador').addEventListener('input', realizarBusca);
    document.getElementById('tipoBusca').addEventListener('change', realizarBusca);
    document.getElementById('btnExportar').addEventListener('click', exportarDados);
    
    // Tradução inicial
    traduzirInterface();

    console.log('Aplicação inicializada com sucesso');
});

// Exportar funções necessárias para o escopo global
window.editarVenda = editarVenda;
window.excluirVenda = excluirVenda;
window.enviarEmail = enviarEmail;
window.visualizarComprovante = visualizarComprovante;
window.abrirCompartilhar = abrirCompartilhar;
window.compartilharVenda = compartilharVenda;
window.alternarIdioma = alternarIdioma;
window.abrirBalanco = abrirBalanco;
window.abrirConfiguracoes = abrirConfiguracoes;
window.realizarBackup = BackupManager.realizarBackup.bind(BackupManager);
window.restaurarBackup = BackupManager.restaurarBackup.bind(BackupManager);
