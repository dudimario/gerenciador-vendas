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

// Função para carregar vendas do Firestore
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

// Função para salvar venda no Firestore
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

// Função para excluir venda do Firestore
async function excluirVenda(id) {
    try {
        await db.collection('vendas').doc(id).delete();
        vendas = vendas.filter(v => v.id !== id);
        atualizarTabela();
        return true;
    } catch (error) {
        console.error('Erro ao excluir venda:', error);
        return false;
    }
}
