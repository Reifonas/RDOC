/**
 * Utilitários para formatação de datas
 */

/**
 * Formata uma data para o formato brasileiro dd/mm/aa
 * @param date - Data a ser formatada (string ISO, Date object ou timestamp)
 * @returns String no formato dd/mm/aa
 */
export function formatDateBR(date: string | Date | number): string {
  if (!date) return '';
  
  const dateObj = new Date(date);
  
  // Verifica se a data é válida
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear().toString().slice(-2); // Pega apenas os 2 últimos dígitos
  
  return `${day}/${month}/${year}`;
}

/**
 * Formata uma data para o formato brasileiro completo dd/mm/aaaa
 * @param date - Data a ser formatada (string ISO, Date object ou timestamp)
 * @returns String no formato dd/mm/aaaa
 */
export function formatDateBRFull(date: string | Date | number): string {
  if (!date) return '';
  
  const dateObj = new Date(date);
  
  // Verifica se a data é válida
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  return dateObj.toLocaleDateString('pt-BR');
}

/**
 * Converte uma data do formato brasileiro dd/mm/aa ou dd/mm/aaaa para ISO (yyyy-mm-dd)
 * @param dateBR - Data no formato dd/mm/aa ou dd/mm/aaaa
 * @returns String no formato ISO yyyy-mm-dd
 */
export function convertBRToISO(dateBR: string): string {
  if (!dateBR || dateBR.length < 8) return '';
  
  const parts = dateBR.split('/');
  if (parts.length !== 3) return '';
  
  const [day, month, year] = parts;
  
  // Se o ano tem 2 dígitos, assume que é 20xx
  const fullYear = year.length === 2 ? `20${year}` : year;
  
  return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Valida se uma data no formato brasileiro está correta
 * @param dateBR - Data no formato dd/mm/aa ou dd/mm/aaaa
 * @returns boolean indicando se a data é válida
 */
export function validateBRDate(dateBR: string): boolean {
  if (!dateBR) return false;
  
  const parts = dateBR.split('/');
  if (parts.length !== 3) return false;
  
  const dayStr = parts[0];
  const monthStr = parts[1];
  const yearStr = parts[2];
  
  if (!dayStr || !monthStr || !yearStr) return false;
  
  const day = Number(dayStr);
  const month = Number(monthStr);
  const year = Number(yearStr);
  
  // Validações básicas
  if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
  if (day < 1 || day > 31) return false;
  if (month < 1 || month > 12) return false;
  
  // Criar data e verificar se é válida
  const fullYear = year < 100 ? 2000 + year : year;
  const dateObj = new Date(fullYear, month - 1, day);
  
  return dateObj.getDate() === day && 
         dateObj.getMonth() === month - 1 && 
         dateObj.getFullYear() === fullYear;
}

/**
 * Formata input de data brasileira com máscara dd/mm/aaaa
 * @param value - Valor atual do input
 * @returns String formatada com máscara
 */
export function formatBRDateInput(value: string): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a máscara dd/mm/aaaa
  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 4) {
    return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
  } else if (numbers.length <= 8) {
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
  }
  
  return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
}

/**
 * Converte uma data do formato ISO (yyyy-mm-dd) para brasileiro dd/mm/aa
 * @param dateISO - Data no formato ISO yyyy-mm-dd
 * @returns String no formato dd/mm/aa
 */
export function convertISOToBR(dateISO: string): string {
  if (!dateISO) return '';
  
  const dateObj = new Date(dateISO);
  return formatDateBR(dateObj);
}

/**
 * Obtém a data atual no formato brasileiro dd/mm/aa
 * @returns String no formato dd/mm/aa
 */
export function getCurrentDateBR(): string {
  return formatDateBR(new Date());
}

/**
 * Obtém a data atual no formato ISO yyyy-mm-dd
 * @returns String no formato ISO yyyy-mm-dd
 */
export function getCurrentDateISO(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}