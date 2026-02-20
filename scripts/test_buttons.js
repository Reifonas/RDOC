// Script para testar os botões do CreateRDO
// Execute este script no console do navegador na página CreateRDO

console.log('=== TESTE DOS BOTÕES DO RDO ===');

// Função para testar se um botão existe e está clicável
function testButton(selector, name) {
  const button = document.querySelector(selector);
  if (button) {
    console.log(`✅ Botão "${name}" encontrado:`, button);
    console.log(`   - Texto: ${button.textContent.trim()}`);
    console.log(`   - Disabled: ${button.disabled}`);
    console.log(`   - Display: ${getComputedStyle(button).display}`);
    console.log(`   - Visibility: ${getComputedStyle(button).visibility}`);
    
    // Testar clique
    try {
      button.click();
      console.log(`✅ Clique no botão "${name}" executado com sucesso`);
    } catch (error) {
      console.error(`❌ Erro ao clicar no botão "${name}":`, error);
    }
  } else {
    console.error(`❌ Botão "${name}" não encontrado com seletor: ${selector}`);
  }
  console.log('---');
}

// Testar botões específicos
testButton('button:contains("Adicionar Atividade")', 'Adicionar Atividade');
testButton('button:contains("Adicionar Inspeção de Solda")', 'Adicionar Inspeção de Solda');
testButton('button:contains("Adicionar Verificação de Torque")', 'Adicionar Verificação de Torque');
testButton('button:contains("Adicionar Mão de Obra")', 'Adicionar Mão de Obra');

// Alternativa: buscar por texto contendo
const buttons = Array.from(document.querySelectorAll('button'));
console.log('\n=== TODOS OS BOTÕES ENCONTRADOS ===');
buttons.forEach((btn, index) => {
  const text = btn.textContent.trim();
  if (text.includes('Adicionar')) {
    console.log(`${index + 1}. "${text}"`);
    console.log(`   - Disabled: ${btn.disabled}`);
    console.log(`   - onClick: ${btn.onclick ? 'Definido' : 'Não definido'}`);
  }
});

console.log('\n=== TESTE CONCLUÍDO ===');