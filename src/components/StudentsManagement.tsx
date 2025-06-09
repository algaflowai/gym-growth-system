
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const StudentsManagement = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Gestão de Alunos</h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">Gerencie todos os alunos da academia</p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Lista de Alunos</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os alunos cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Esta funcionalidade será implementada em breve.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Aqui você poderá visualizar, editar e gerenciar todos os alunos cadastrados.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentsManagement;
