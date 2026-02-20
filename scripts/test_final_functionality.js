// Script de teste final para verificar funcionalidades do RDO

console.log('🧪 INICIANDO TESTE FINAL DE FUNCIONALIDADES');

// Função para aguardar um tempo
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Função para testar se elementos existem
const testElementExists = (selector, description) => {
  const element = document.querySelector(selector);
  if (element) {
    console.log(`✅ ${description}: ENCONTRADO`);
    return element;
  } else {
    console.log(`❌ ${description}: NÃO ENCONTRADO`);
    return null;
  }
};

// Função para testar clique em botão
const testButtonClick = async (selector, description) => {
  const button = testElementExists(selector, `Botão ${description}`);
  if (button) {
    console.log(`🎯 Testando clique no botão: ${description}`);
    button.click();
    await wait(500); // Aguarda meio segundo
    console.log(`✅ Clique executado em: ${description}`);
    return true;
  }
  return false;
};

// Função principal de teste
const runTests = async () => {
  console.log('\n📋 VERIFICANDO ELEMENTOS DA PÁGINA...');
  
  // Testar se a página carregou
  testElementExists('h1', 'Título da página');
  
  // Testar seções
  testElementExists('[data-section="atividades"]', 'Seção de Atividades');
  testElementExists('[data-section="inspecao"]', 'Seção de Inspeção de Qualidade');
  testElementExists('[data-section="mao-obra"]', 'Seção de Mão de Obra');
  
  console.log('\n🎯 TESTANDO BOTÕES DE ADICIONAR...');
  
  // Testar botões de adicionar (usando texto do botão)
  const buttons = [
    { text: 'Adicionar Atividade', description: 'Adicionar Atividade' },
    { text: 'Adicionar Inspeção de Solda', description: 'Adicionar Inspeção de Solda' },
    { text: 'Adicionar Verificação de Torque', description: 'Adicionar Verificação de Torque' }
  ];
  
  for (const button of buttons) {
    const buttonElement = Array.from(document.querySelectorAll('button'))
      .find(btn => btn.textContent.includes(button.text));
    
    if (buttonElement) {
      console.log(`🎯 Testando: ${button.description}`);
      buttonElement.click();
      await wait(1000);
    } else {
      console.log(`❌ Botão não encontrado: ${button.description}`);
    }
  }
  
  console.log('\n📊 VERIFICANDO DADOS CARREGADOS...');
  
  // Verificar se há dados nas stores
  if (window.useConfigStore) {
    const store = window.useConfigStore.getState();
    console.log('📋 Tipos de Atividade:', store.tiposAtividade?.length || 0);
    console.log('🌤️ Condições Climáticas:', store.condicoesClimaticas?.length || 0);
  } else {
    console.log('⚠️ Store não encontrada no window');
  }
  
  console.log('\n✅ TESTE FINAL CONCLUÍDO!');
};

// Executar testes após carregamento da página
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runTests);
} else {
  runTests();
}

// Também executar após um delay para garantir que tudo carregou
setTimeout(runTests, 2000);