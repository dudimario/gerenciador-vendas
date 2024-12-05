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
