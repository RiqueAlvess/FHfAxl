import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function ObrigadoPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-3xl">Obrigado por participar!</CardTitle>
          <CardDescription className="text-lg">
            Seu questionário foi enviado com sucesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="space-y-4 text-gray-600">
            <p>
              Sua contribuição é fundamental para melhorarmos o ambiente de trabalho e
              promovermos o bem-estar de todos os colaboradores.
            </p>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">
                🔒 Suas respostas são confidenciais
              </h3>
              <p className="text-sm text-blue-800">
                Todos os dados são tratados de forma anônima e agregada, conforme a LGPD.
                Nenhuma resposta individual será compartilhada.
              </p>
            </div>

            <div className="pt-4">
              <h3 className="font-semibold mb-2">Próximos passos:</h3>
              <ul className="text-sm space-y-2">
                <li>✓ Suas respostas foram registradas com segurança</li>
                <li>✓ Os dados serão analisados junto com outros colaboradores</li>
                <li>✓ Relatórios agregados serão compartilhados com a gestão</li>
                <li>✓ Ações de melhoria serão planejadas com base nos resultados</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t">
            <p className="text-xs text-gray-500">
              VIVAMENTE360 - Plataforma de Avaliação de Riscos Psicossociais
              <br />
              Conforme NR-1 • LGPD • GRO/PGR
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
