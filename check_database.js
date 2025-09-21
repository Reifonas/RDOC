import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bbyzrywmgjiufqtnkslu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJieXpyeXdtZ2ppdWZxdG5rc2x1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjE4MzgsImV4cCI6MjA3MDczNzgzOH0.O0Eksg4_cxKk7jbC3wYLWbwZ9FsoTzsztnPPpzGL3pE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log('Verificando dados nas tabelas principais...');
  
  try {
    // Verificar obras
    const { data: obras, error: obrasError } = await supabase
      .from('obras')
      .select('*', { count: 'exact' });
    
    console.log(`Obras: ${obras?.length || 0} registros`);
    if (obrasError) console.error('Erro obras:', obrasError);
    
    // Verificar usuários
    const { data: usuarios, error: usuariosError } = await supabase
      .from('usuarios')
      .select('*', { count: 'exact' });
    
    console.log(`Usuários: ${usuarios?.length || 0} registros`);
    if (usuariosError) console.error('Erro usuários:', usuariosError);
    
    // Verificar tipos de atividade
    const { data: tiposAtividade, error: tiposError } = await supabase
      .from('tipos_atividade')
      .select('*', { count: 'exact' });
    
    console.log(`Tipos de Atividade: ${tiposAtividade?.length || 0} registros`);
    if (tiposError) console.error('Erro tipos atividade:', tiposError);
    
    // Verificar condições climáticas
    const { data: condicoes, error: condicoesError } = await supabase
      .from('condicoes_climaticas')
      .select('*', { count: 'exact' });
    
    console.log(`Condições Climáticas: ${condicoes?.length || 0} registros`);
    if (condicoesError) console.error('Erro condições:', condicoesError);
    
    // Verificar funcionários
    const { data: funcionarios, error: funcionariosError } = await supabase
      .from('funcionarios')
      .select('*', { count: 'exact' });
    
    console.log(`Funcionários: ${funcionarios?.length || 0} registros`);
    if (funcionariosError) console.error('Erro funcionários:', funcionariosError);
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

checkData();