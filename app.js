// config.js

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDnzDkInpxKQcx_Jw8MB-zIhTLzKyzNSyM",
    authDomain: "gerenciador-vendas-ac4bf.firebaseapp.com",
    projectId: "gerenciador-vendas-ac4bf",
    storageBucket: "gerenciador-vendas-ac4bf.firebasestorage.app",
    messagingSenderId: "789648456187",
    appId: "1:789648456187:web:115afacd28fdecf27d335e"
};

// Configurações do sistema
const CONFIG = {
    // Configurações gerais
    APP_NAME: 'Gerenciador de Vendas de Assinaturas',
    VERSION: '2.0.0',
    DEFAULT_LANGUAGE: 'pt',
    DEFAULT_CURRENCY: '₪',
    DATE_FORMAT: 'DD/MM/YYYY',
    
    // Limites e tamanhos
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ITEMS_PER_PAGE: 10,
    MAX_SEARCH_RESULTS: 100,
    
    // Intervalos
    AUTO_BACKUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 horas
    VENCIMENTO_CHECK_INTERVAL: 60 * 60 * 1000, // 1 hora
    
    // Alertas
    ALERT_DAYS_BEFORE: [30, 15, 7, 1], // Dias para alertar antes do vencimento
    
    // Email
    EMAIL_SERVICE_ID: 'service_lb5yt39',
    EMAIL_TEMPLATE_ID: 'template_o0acrgq',
    EMAIL_USER_ID: 'hOEhCYJwa_99mn944',
    DEFAULT_EMAIL: 'davidmeirshrem@gmail.com',
    
    // Formatos suportados
    SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
    SUPPORTED_EXPORT_FORMATS: ['excel', 'pdf', 'csv'],
    
    // Cores do tema
    COLORS: {
        primary: '#0d6efd',
        secondary: '#6c757d',
        success: '#28a745',
        danger: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8',
        light: '#f8f9fa',
        dark: '#343a40'
    },
    
    // Cores dos gráficos
    CHART_COLORS: {
        vendas: '#0d6efd',
        lucro: '#28a745',
        custo: '#dc3545',
        pendente: '#ffc107'
    },

    // Status de pagamento
    PAYMENT_STATUS: {
        PAGO: 'pago',
        PENDENTE: 'pendente',
        VENCIDO: 'vencido',
        CANCELADO: 'cancelado'
    },

    // Produtos padrão
    DEFAULT_PRODUCTS: {
        streaming: [
            'Netflix',
            'Disney+',
            'HBO Max',
            'Amazon Prime',
            'Apple TV+',
            'Paramount+',
            'Star+',
            'Discovery+'
        ],
        musica: [
            'Spotify',
            'YouTube Premium',
            'Deezer',
            'Apple Music',
            'Amazon Music'
        ],
        vpn: [
            'NordVPN',
            'ExpressVPN',
            'CyberGhost'
        ]
    },

    // Duração padrão
    DEFAULT_DURATIONS: [
        { value: '1', label: '1 mês' },
        { value: '3', label: '3 meses' },
        { value: '6', label: '6 meses' },
        { value: '12', label: '1 ano' },
        { value: '24', label: '2 anos' },
        { value: '36', label: '3 anos' },
        { value: 'forever', label: 'Para sempre' },
        { value: 'custom', label: 'Personalizado' }
    ],

    // Configurações de validação
    VALIDATION: {
        MIN_PRODUCT_LENGTH: 2,
        MAX_PRODUCT_LENGTH: 50,
        MIN_NAME_LENGTH: 2,
        MAX_NAME_LENGTH: 100,
        MIN_PRICE: 0,
        MAX_PRICE: 1000000,
        MAX_NOTES_LENGTH: 1000
    },

    // Configurações de backup
    BACKUP: {
        AUTO_BACKUP_ENABLED: true,
        BACKUP_FREQUENCY: 'daily', // daily, weekly, monthly
        MAX_BACKUP_FILES: 10,
        COMPRESSION_ENABLED: true
    },

    // Configurações de notificações
    NOTIFICATIONS: {
        EMAIL_ENABLED: true,
        BROWSER_ENABLED: true,
        WHATSAPP_ENABLED: false,
        NOTIFICATION_TYPES: {
            NOVA_VENDA: 'nova_venda',
            VENCIMENTO_PROXIMO: 'vencimento_proximo',
            PAGAMENTO_PENDENTE: 'pagamento_pendente',
            BACKUP_REALIZADO: 'backup_realizado'
        }
    }
};

// Exportar configurações
export { firebaseConfig, CONFIG };
// translations.js

const translations = {
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

        // Formulários
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

        // Status
        pago: "Pago",
        pendente: "Pendente",
        vencido: "Vencido",
        ativo: "Ativo",
        cancelado: "Cancelado",

        // Ações
        salvar: "Salvar",
        cancelar: "Cancelar",
        editar: "Editar",
        excluir: "Excluir",
        buscar: "Buscar",
        exportar: "Exportar",
        importar: "Importar",
        compartilhar: "Compartilhar",
        confirmar: "Confirmar",
        voltar: "Voltar",

        // Mensagens
        vendaSalva: "Venda salva com sucesso!",
        vendaExcluida: "Venda excluída com sucesso!",
        confirmarExclusao: "Tem certeza que deseja excluir esta venda?",
        erroSalvar: "Erro ao salvar venda",
        erroExcluir: "Erro ao excluir venda",
        
        // Relatórios
        relatorioVendas: "Relatório de Vendas",
        relatorioFinanceiro: "Relatório Financeiro",
        relatorioProdutos: "Relatório de Produtos",
        relatorioClientes: "Relatório de Clientes",
        
        // Gráficos
        graficoVendas: "Vendas por Período",
        graficoLucros: "Lucros por Período",
        graficoProdutos: "Produtos mais Vendidos",
        graficoStatus: "Status das Vendas",

        // Notificações
        notificacoes: "Notificações",
        semNotificacoes: "Nenhuma notificação",
        verTodas: "Ver todas",
        marcarLida: "Marcar como lida",
        
        // Validações
        campoObrigatorio: "Este campo é obrigatório",
        emailInvalido: "Email inválido",
        valorInvalido: "Valor inválido",
        dataInvalida: "Data inválida",

        // Emails
        emailNovaVenda: "Nova venda registrada",
        emailVencimento: "Produto próximo ao vencimento",
        emailPagamentoPendente: "Pagamento pendente",
        
        // Backup
        backupRealizado: "Backup realizado com sucesso",
        erroBackup: "Erro ao realizar backup",
        restaurarBackup: "Restaurar backup",
        confirmarRestauracao: "Tem certeza que deseja restaurar este backup?",

        // Configurações
        configuracoesGerais: "Configurações Gerais",
        configuracoesEmail: "Configurações de Email",
        configuracoesNotificacoes: "Configurações de Notificações",
        configuracoesBackup: "Configurações de Backup",
        salvarConfiguracoes: "Salvar configurações",
        
        // Outros
        carregando: "Carregando...",
        processando: "Processando...",
        aguarde: "Aguarde...",
        erro: "Erro",
        sucesso: "Sucesso",
        atencao: "Atenção",
        info: "Informação"
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

        // Formulários
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

        // Status
        pago: "שולם",
        pendente: "ממתין",
        vencido: "פג תוקף",
        ativo: "פעיל",
        cancelado: "מבוטל",

        // Ações
        salvar: "שמור",
        cancelar: "בטל",
        editar: "ערוך",
        excluir: "מחק",
        buscar: "חפש",
        exportar: "ייצא",
        importar: "ייבא",
        compartilhar: "שתף",
        confirmar: "אשר",
        voltar: "חזור",

        // Mensagens
        vendaSalva: "המכירה נשמרה בהצלחה!",
        vendaExcluida: "המכירה נמחקה בהצלחה!",
        confirmarExclusao: "האם אתה בטוח שברצונך למחוק מכירה זו?",
        erroSalvar: "שגיאה בשמירת המכירה",
        erroExcluir: "שגיאה במחיקת המכירה",

        // ... (todas as outras traduções em hebraico)
    }
};

// Função para traduzir a interface
function traduzirInterface(idioma) {
    document.querySelectorAll('[data-translate]').forEach(elemento => {
        const chave = elemento.getAttribute('data-translate');
        if (translations[idioma][chave]) {
            elemento.textContent = translations[idioma][chave];
        }
    });

    document.querySelectorAll('[data-translate-placeholder]').forEach(elemento => {
        const chave = elemento.getAttribute('data-translate-placeholder');
        if (translations[idioma][chave]) {
            elemento.placeholder = translations[idioma][chave];
        }
    });

    // Atualizar direção do texto
    document.documentElement.setAttribute('dir', idioma === 'he' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', idioma);
}

// Exportar traduções e função
export { translations, traduzirInterface };
// database.js
import { firebaseConfig } from './config.js';

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

class Database {
    static async salvarVenda(venda) {
        try {
            // Se tem comprovante em base64, fazer upload
            if (venda.comprovante && venda.comprovante.startsWith('data:')) {
                const ref = storage.ref(`comprovantes/${venda.id}`);
                await ref.putString(venda.comprovante, 'data_url');
                venda.comprovante = await ref.getDownloadURL();
            }

            await db.collection('vendas').doc(venda.id).set(venda);
            return true;
        } catch (error) {
            console.error('Erro ao salvar venda:', error);
            throw error;
        }
    }

    static async carregarVendas() {
        try {
            const snapshot = await db.collection('vendas').get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Erro ao carregar vendas:', error);
            throw error;
        }
    }

    static async excluirVenda(id) {
        try {
            const venda = await db.collection('vendas').doc(id).get();
            if (venda.exists && venda.data().comprovante) {
                await storage.refFromURL(venda.data().comprovante).delete();
            }
            await db.collection('vendas').doc(id).delete();
            return true;
        } catch (error) {
            console.error('Erro ao excluir venda:', error);
            throw error;
        }
    }

    static async buscarVendas(filtros) {
        try {
            let query = db.collection('vendas');

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
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Erro ao buscar vendas:', error);
            throw error;
        }
    }

    static async realizarBackup() {
        try {
            const vendas = await this.carregarVendas();
            const backup = {
                data: new Date().toISOString(),
                vendas,
                configuracoes: JSON.parse(localStorage.getItem('configuracoes') || '{}')
            };
            return backup;
        } catch (error) {
            console.error('Erro ao realizar backup:', error);
            throw error;
        }
    }

    static async restaurarBackup(dados) {
        try {
            // Limpar dados existentes
            const batch = db.batch();
            const snapshot = await db.collection('vendas').get();
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();

            // Restaurar vendas
            for (const venda of dados.vendas) {
                await this.salvarVenda(venda);
            }

            // Restaurar configurações
            localStorage.setItem('configuracoes', JSON.stringify(dados.configuracoes));

            return true;
        } catch (error) {
            console.error('Erro ao restaurar backup:', error);
            throw error;
        }
    }
}

export { Database };
// interface.js
import { CONFIG } from './config.js';
import { translations, traduzirInterface } from './translations.js';
import { Database } from './database.js';
import { Charts } from './charts.js';
import { Reports } from './reports.js';
import { Backup } from './backup.js';

class Interface {
    static async inicializar() {
        // Carregar configurações
        this.carregarConfiguracoes();

        // Inicializar tradução
        this.inicializarTraducao();

        // Carregar vendas
        await this.carregarVendas();

        // Inicializar gráficos
        Charts.inicializar();

        // Configurar event listeners
        this.configurarEventListeners();

        // Inicializar verificação de vencimentos
        this.iniciarVerificacaoVencimentos();

        console.log('Interface inicializada');
    }

    static carregarConfiguracoes() {
        const configSalva = localStorage.getItem('configuracoes');
        if (configSalva) {
            this.config = JSON.parse(configSalva);
        } else {
            this.config = {
                idioma: CONFIG.DEFAULT_LANGUAGE,
                moeda: CONFIG.DEFAULT_CURRENCY,
                formatoData: CONFIG.DATE_FORMAT,
                backupAutomatico: CONFIG.BACKUP.AUTO_BACKUP_ENABLED,
                notificacoes: CONFIG.NOTIFICATIONS
            };
            this.salvarConfiguracoes();
        }
    }

    static salvarConfiguracoes() {
        localStorage.setItem('configuracoes', JSON.stringify(this.config));
    }

    static inicializarTraducao() {
        traduzirInterface(this.config.idioma);
    }

    static async carregarVendas() {
        try {
            const vendas = await Database.carregarVendas();
            this.atualizarTabela(vendas);
            this.atualizarEstatisticas(vendas);
            Charts.atualizarGraficos(vendas);
        } catch (error) {
            console.error('Erro ao carregar vendas:', error);
            this.mostrarErro('Erro ao carregar vendas');
        }
    }

    static configurarEventListeners() {
        // Formulário de venda
        document.getElementById('vendaForm')?.addEventListener('submit', this.handleSubmitVenda.bind(this));

        // Busca
        document.getElementById('buscador')?.addEventListener('input', this.realizarBusca.bind(this));
        document.getElementById('btnBuscar')?.addEventListener('click', this.realizarBusca.bind(this));

        // Exportação
        document.getElementById('btnExportar')?.addEventListener('click', Reports.exportarDados.bind(Reports));

        // Backup
        document.getElementById('btnBackup')?.addEventListener('click', Backup.realizarBackup.bind(Backup));

        // Configurações
        document.getElementById('btnConfig')?.addEventListener('click', this.abrirConfiguracoes.bind(this));

        // Outros listeners...
    }

    static async handleSubmitVenda(e) {
        e.preventDefault();
        
        try {
            const venda = this.coletarDadosFormulario();
            if (!this.validarVenda(venda)) return;

            await Database.salvarVenda(venda);
            this.mostrarSucesso('Venda salva com sucesso');
            this.limparFormulario();
            await this.carregarVendas();
        } catch (error) {
            console.error('Erro ao salvar venda:', error);
            this.mostrarErro('Erro ao salvar venda');
        }
    }

    // ... (mais métodos da interface)
}

export { Interface };
// charts.js
import { CONFIG } from './config.js';

class Charts {
    static charts = {};

    static inicializar() {
        this.criarGraficoVendas();
        this.criarGraficoLucros();
        this.criarGraficoProdutos();
        this.criarGraficoStatus();
    }

    static criarGraficoVendas() {
        const ctx = document.getElementById('graficoVendas')?.getContext('2d');
        if (!ctx) return;

        this.charts.vendas = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Vendas',
                    data: [],
                    borderColor: CONFIG.CHART_COLORS.vendas,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }

    static criarGraficoLucros() {
        const ctx = document.getElementById('graficoLucros')?.getContext('2d');
        if (!ctx) return;

        this.charts.lucros = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Lucro',
                    data: [],
                    backgroundColor: CONFIG.CHART_COLORS.lucro
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    static criarGraficoProdutos() {
        const ctx = document.getElementById('graficoProdutos')?.getContext('2d');
        if (!ctx) return;

        this.charts.produtos = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: Object.values(CONFIG.CHART_COLORS)
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    static criarGraficoStatus() {
        const ctx = document.getElementById('graficoStatus')?.getContext('2d');
        if (!ctx) return;

        this.charts.status = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Pago', 'Pendente', 'Vencido'],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        CONFIG.CHART_COLORS.success,
                        CONFIG.CHART_COLORS.warning,
                        CONFIG.CHART_COLORS.danger
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    static atualizarGraficos(vendas) {
        this.atualizarGraficoVendas(vendas);
        this.atualizarGraficoLucros(vendas);
        this.atualizarGraficoProdutos(vendas);
        this.atualizarGraficoStatus(vendas);
    }

    static atualizarGraficoVendas(vendas) {
        if (!this.charts.vendas) return;

        const vendasPorDia = this.agruparVendasPorDia(vendas);
        const labels = Object.keys(vendasPorDia);
        const data = Object.values(vendasPorDia);

        this.charts.vendas.data.labels = labels;
        this.charts.vendas.data.datasets[0].data = data;
        this.charts.vendas.update();
    }

    static atualizarGraficoLucros(vendas) {
        if (!this.charts.lucros) return;

        const lucrosPorDia = this.agruparLucrosPorDia(vendas);
        const labels = Object.keys(lucrosPorDia);
        const data = Object.values(lucrosPorDia);

        this.charts.lucros.data.labels = labels;
        this.charts.lucros.data.datasets[0].data = data;
        this.charts.lucros.update();
    }

    static atualizarGraficoProdutos(vendas) {
        if (!this.charts.produtos) return;

        const produtosCount = {};
        vendas.forEach(venda => {
            produtosCount[venda.produto] = (produtosCount[venda.produto] || 0) + 1;
        });

        const labels = Object.keys(produtosCount);
        const data = Object.values(produtosCount);

        this.charts.produtos.data.labels = labels;
        this.charts.produtos.data.datasets[0].data = data;
        this.charts.produtos.update();
    }

    static atualizarGraficoStatus(vendas) {
        if (!this.charts.status) return;

        const statusCount = {
            pago: 0,
            pendente: 0,
            vencido: 0
        };

        vendas.forEach(venda => {
            const status = this.getStatus(venda);
            statusCount[status]++;
        });

        this.charts.status.data.datasets[0].data = [
            statusCount.pago,
            statusCount.pendente,
            statusCount.vencido
        ];
        this.charts.status.update();
    }

    static agruparVendasPorDia(vendas) {
        const grupos = {};
        vendas.forEach(venda => {
            const data = venda.dataCompra.split('T')[0];
            grupos[data] = (grupos[data] || 0) + 1;
        });
        return grupos;
    }

    static agruparLucrosPorDia(vendas) {
        const grupos = {};
        vendas.forEach(venda => {
            const data = venda.dataCompra.split('T')[0];
            grupos[data] = (grupos[data] || 0) + parseFloat(venda.lucro);
        });
        return grupos;
    }

    static getStatus(venda) {
        if (venda.statusPagamento === 'pago') return 'pago';
        if (new Date(venda.dataVencimento) < new Date()) return 'vencido';
        return 'pendente';
    }
}

export { Charts };
// reports.js
import { CONFIG } from './config.js';
import { translations } from './translations.js';

class Reports {
    static async gerarRelatorio(tipo, filtros = {}) {
        try {
            const vendas = await this.filtrarVendas(filtros);
            const dados = this.processarDados(vendas, tipo);
            return dados;
        } catch (error) {
            console.error('Erro ao gerar relatório:', error);
            throw error;
        }
    }

    static async exportarDados(formato = 'excel') {
        try {
            const vendas = await Database.carregarVendas();
            
            switch(formato.toLowerCase()) {
                case 'excel':
                    return this.exportarExcel(vendas);
                case 'pdf':
                    return this.exportarPDF(vendas);
                case 'csv':
                    return this.exportarCSV(vendas);
                default:
                    throw new Error('Formato não suportado');
            }
        } catch (error) {
            console.error('Erro ao exportar dados:', error);
            throw error;
        }
    }

    static async exportarExcel(vendas) {
        const wb = XLSX.utils.book_new();
        
        // Aba de vendas
        const wsVendas = XLSX.utils.json_to_sheet(this.formatarVendasParaExport(vendas));
        XLSX.utils.book_append_sheet(wb, wsVendas, 'Vendas');

        // Aba de resumo
        const resumo = this.gerarResumo(vendas);
        const wsResumo = XLSX.utils.json_to_sheet(resumo);
        XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');

        // Salvar arquivo
        XLSX.writeFile(wb, `vendas_${new Date().toLocaleDateString()}.xlsx`);
    }

    static async exportarPDF(vendas) {
        const doc = new jsPDF();
        
        // Título
        doc.setFontSize(18);
        doc.text('Relatório de Vendas', 14, 20);

        // Informações gerais
        doc.setFontSize(12);
        doc.text(`Data: ${new Date().toLocaleDateString()}`, 14, 30);
        doc.text(`Total de Vendas: ${vendas.length}`, 14, 40);

        // Tabela de vendas
        const vendasFormatadas = this.formatarVendasParaExport(vendas);
        doc.autoTable({
            startY: 50,
            head: [Object.keys(vendasFormatadas[0])],
            body: vendasFormatadas.map(Object.values)
        });

        // Salvar arquivo
        doc.save(`vendas_${new Date().toLocaleDateString()}.pdf`);
    }

    static async exportarCSV(vendas) {
        const vendasFormatadas = this.formatarVendasParaExport(vendas);
        const headers = Object.keys(vendasFormatadas[0]);
        const rows = vendasFormatadas.map(Object.values);
        
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `vendas_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    static formatarVendasParaExport(vendas) {
        return vendas.map(venda => ({
            Produto: venda.produto,
            Origem: venda.origemProduto,
            Serial: venda.numeroSerial || '',
            Nome: venda.nomeComprador,
            Email: venda.email || '',
            Telefone: venda.telefoneComprador || '',
            'Data Compra': new Date(venda.dataCompra).toLocaleDateString(),
            'Data Vencimento': new Date(venda.dataVencimento).toLocaleDateString(),
            'Custo (₪)': venda.precoCusto || '0',
            'Venda (₪)': venda.precoVenda,
            'Lucro (₪)': venda.lucro,
            Status: venda.statusPagamento,
            Anotações: venda.anotacoes || ''
        }));
    }

    static gerarResumo(vendas) {
        const resumo = {
            'Total de Vendas': vendas.length,
            'Custo Total': vendas.reduce((acc, v) => acc + (parseFloat(v.precoCusto) || 0), 0),
            'Venda Total': vendas.reduce((acc, v) => acc + parseFloat(v.precoVenda), 0),
            'Lucro Total': vendas.reduce((acc, v) => acc + parseFloat(v.lucro), 0),
            'Vendas Pagas': vendas.filter(v => v.statusPagamento === 'pago').length,
            'Vendas Pendentes': vendas.filter(v => v.statusPagamento === 'pendente').length
        };

        return Object.entries(resumo).map(([chave, valor]) => ({
            Métrica: chave,
            Valor: typeof valor === 'number' ? valor.toFixed(2) : valor
        }));
    }
}

export { Reports };
// backup.js
import { CONFIG } from './config.js';
import { Database } from './database.js';

class Backup {
    static async realizarBackup(tipo = 'manual') {
        try {
            const dados = await Database.realizarBackup();
            
            if (tipo === 'manual') {
                this.downloadBackup(dados);
            } else {
                await this.salvarBackupAutomatico(dados);
            }

            return true;
        } catch (error) {
            console.error('Erro ao realizar backup:', error);
            throw error;
        }
    }

    static downloadBackup(dados) {
        const blob = new Blob([JSON.stringify(dados)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup_${new Date().toISOString()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    static async salvarBackupAutomatico(dados) {
        const backups = JSON.parse(localStorage.getItem('backups') || '[]');
        backups.push({
            data: new Date().toISOString(),
            dados
        });

        // Manter apenas os últimos N backups
        while (backups.length > CONFIG.BACKUP.MAX_BACKUP_FILES) {
            backups.shift();
        }

        localStorage.setItem('backups', JSON.stringify(backups));
    }

    static async restaurarBackup(arquivo) {
        try {
            const texto = await arquivo.text();
            const dados = JSON.parse(texto);

            if (!this.validarBackup(dados)) {
                throw new Error('Arquivo de backup inválido');
            }

            await Database.restaurarBackup(dados);
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
               dados.data;
    }

    static agendarBackupAutomatico() {
        if (!CONFIG.BACKUP.AUTO_BACKUP_ENABLED) return;

        setInterval(async () => {
            try {
                await this.realizarBackup('auto');
                console.log('Backup automático realizado com sucesso');
            } catch (error) {
                console.error('Erro no backup automático:', error);
            }
        }, CONFIG.AUTO_BACKUP_INTERVAL);
    }
}

export { Backup };
// app.js
import { CONFIG } from './config.js';
import { Interface } from './interface.js';
import { Database } from './database.js';
import { Charts } from './charts.js';
import { Reports } from './reports.js';
import { Backup } from './backup.js';

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', async function() {
    try {
        console.log('Iniciando aplicação...');
        
        // Inicializar interface
        await Interface.inicializar();
        
        // Configurar backup automático
        Backup.agendarBackupAutomatico();
        
        console.log('Aplicação iniciada com sucesso');
    } catch (error) {
        console.error('Erro ao iniciar aplicação:', error);
        alert('Erro ao iniciar aplicação. Por favor, recarregue a página.');
    }
});

// Exportar para o escopo global
window.Interface = Interface;
window.Database = Database;
window.Charts = Charts;
window.Reports = Reports;
window.Backup = Backup;
