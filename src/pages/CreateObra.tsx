
import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
    ArrowLeft,
    Save,
    Building2,
    MapPin,
    Calendar,
    User,
    Loader2
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { supabase, type TablesInsert } from '../lib/supabase';
import { useAuthContext as useAuth } from '../contexts/AuthContext';
import { useCurrentUser } from '../stores/useUserStore';

const obraSchema = z.object({
    nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    descricao: z.string().optional(),
    endereco: z.string().optional(),
    cidade: z.string().optional(),
    estado: z.string().optional(),
    data_inicio: z.string().optional(),
    data_prevista_fim: z.string().optional(),
    responsavel_id: z.string().optional(),
});

type ObraFormData = z.infer<typeof obraSchema>;

export default function CreateObra() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const currentUser = useCurrentUser();

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ObraFormData>({
        resolver: zodResolver(obraSchema),
        defaultValues: {
            data_inicio: new Date().toISOString().split('T')[0]
        }
    });

    const onSubmit = async (data: ObraFormData) => {
        try {
            if (!currentUser?.organizacao_id) {
                toast.error('Erro: Organização não identificada. Tente fazer login novamente.');
                return;
            }

            const newObra: TablesInsert<'obras'> = {
                nome: data.nome,
                descricao: data.descricao,
                endereco: data.endereco,
                cidade: data.cidade,
                estado: data.estado,
                data_inicio: data.data_inicio || null,
                data_prevista_fim: data.data_prevista_fim || null,
                status: 'ativa',
                progresso_geral: 0,
                configuracoes: {},
                responsavel_id: data.responsavel_id || currentUser.id,
                organizacao_id: currentUser.organizacao_id
            };

            const { error } = await supabase
                .from('obras')
                .insert(newObra as any);

            if (error) throw error;

            toast.success('Obra criada com sucesso!');
            navigate('/cadastros');
        } catch (error: unknown) {
            console.error('Erro ao criar obra:', error);
            const message = error instanceof Error ? error.message : 'Erro desconhecido';
            toast.error(`Erro ao criar obra: ${message}`);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10">
                <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/cadastros" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
                            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Nova Obra</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Cadastre um novo empreendimento</p>
                        </div>
                    </div>
                    <ThemeToggle />
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 sm:p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg space-y-6"
                    >
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Dados Principais</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nome da Obra *
                                </label>
                                <input
                                    type="text"
                                    {...register('nome')}
                                    className="w-full p-3 bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="Ex: Edifício Residencial Aurora"
                                />
                                {errors.nome && (
                                    <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>
                                )}
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Descrição
                                </label>
                                <textarea
                                    {...register('descricao')}
                                    rows={3}
                                    className="w-full p-3 bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="Breve descrição do projeto..."
                                />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg space-y-6"
                    >
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Localização</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Endereço
                                </label>
                                <input
                                    type="text"
                                    {...register('endereco')}
                                    className="w-full p-3 bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="Rua, número, bairro..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Cidade
                                </label>
                                <input
                                    type="text"
                                    {...register('cidade')}
                                    className="w-full p-3 bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Estado
                                </label>
                                <input
                                    type="text"
                                    {...register('estado')}
                                    className="w-full p-3 bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="UF"
                                    maxLength={2}
                                />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg space-y-6"
                    >
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Prazos e Responsáveis</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Data de Início
                                </label>
                                <input
                                    type="date"
                                    {...register('data_inicio')}
                                    className="w-full p-3 bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Previsão de Término
                                </label>
                                <input
                                    type="date"
                                    {...register('data_prevista_fim')}
                                    className="w-full p-3 bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    ID do Responsável (Opcional)
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        {...register('responsavel_id')}
                                        className="w-full pl-10 p-3 bg-white/50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                                        placeholder="UUID do usuário responsável"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Se vazio, será atribuído ao seu usuário.</p>
                            </div>
                        </div>
                    </motion.div>

                    <div className="flex gap-4 pt-4">
                        <Link
                            to="/cadastros"
                            className="flex-1 py-3 px-4 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-2 font-medium transition-colors"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2 font-medium shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Salvar Obra
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
