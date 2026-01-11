"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Shield,
  FileText,
  Download,
  Trash2,
  Eye,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";
import { LGPDInfo } from "@/components/lgpd/LGPDInfo";

/**
 * Página de Direitos do Titular (LGPD)
 *
 * Permite que usuários visualizem e exerçam seus direitos
 * conforme a Lei Geral de Proteção de Dados (LGPD).
 */
export default function LGPDPage() {
  const [selectedTab, setSelectedTab] = useState("informacoes");
  const [solicitacaoMotivo, setSolicitacaoMotivo] = useState("");
  const [solicitacaoEnviada, setSolicitacaoEnviada] = useState(false);

  const handleSolicitacaoPortabilidade = () => {
    // TODO: Implementar API de portabilidade
    alert("Sua solicitação de portabilidade foi enviada. Você receberá os dados em até 15 dias úteis.");
    setSolicitacaoEnviada(true);
  };

  const handleSolicitacaoExclusao = () => {
    if (!solicitacaoMotivo.trim()) {
      alert("Por favor, informe o motivo da solicitação de exclusão.");
      return;
    }

    // TODO: Implementar API de exclusão
    alert(
      "Sua solicitação de exclusão foi enviada para análise. Responderemos em até 15 dias úteis. " +
      "Dados com obrigação legal de retenção (5 anos) serão mantidos conforme legislação trabalhista."
    );
    setSolicitacaoEnviada(true);
    setSolicitacaoMotivo("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Direitos do Titular - LGPD</h1>
        <p className="text-muted-foreground mt-2">
          Exercer seus direitos de privacidade e proteção de dados pessoais
        </p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="informacoes">Informações</TabsTrigger>
          <TabsTrigger value="meus-dados">Meus Dados</TabsTrigger>
          <TabsTrigger value="solicitacoes">Solicitações</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        {/* Informações sobre LGPD e K-Anonymity */}
        <TabsContent value="informacoes">
          <LGPDInfo />
        </TabsContent>

        {/* Visualizar Meus Dados */}
        <TabsContent value="meus-dados" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Visualizar Meus Dados
              </CardTitle>
              <CardDescription>
                Veja quais dados pessoais estão armazenados sobre você
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>K-Anonymity Aplicado</AlertTitle>
                <AlertDescription>
                  Suas respostas individuais ao questionário não podem ser visualizadas diretamente
                  para proteger sua privacidade. Apenas dados agregados (mínimo 5 respondentes) são
                  exibidos nos relatórios.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Dados Cadastrais</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">E-mail</p>
                      <p className="font-medium">Carregando...</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Unidade</p>
                      <p className="font-medium">Carregando...</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Setor</p>
                      <p className="font-medium">Carregando...</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cargo</p>
                      <p className="font-medium">Carregando...</p>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Respostas ao Questionário</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total de respostas enviadas</span>
                      <Badge>0</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Último ciclo respondido</span>
                      <Badge variant="outline">Nenhum</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Consentimento LGPD</span>
                      <Badge variant="secondary">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Concedido
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">
                    <Clock className="h-4 w-4 inline mr-2" />
                    Retenção de Dados
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Seus dados serão mantidos por <strong>5 anos</strong> a partir da última resposta,
                    conforme exigências legais trabalhistas (CLT, NR-1).
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Data de expiração:</span>
                    <Badge variant="outline">Calculando...</Badge>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Dados Sensíveis Protegidos</AlertTitle>
                <AlertDescription>
                  Por motivos de segurança, alguns dados como IPs de acesso e metadados de auditoria
                  não são exibidos nesta interface. Você pode solicitar um relatório completo através
                  da aba "Solicitações".
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Solicitações LGPD */}
        <TabsContent value="solicitacoes" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Portabilidade de Dados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Download className="h-5 w-5" />
                  Portabilidade de Dados
                </CardTitle>
                <CardDescription>
                  Solicitar cópia dos seus dados em formato estruturado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Você receberá um arquivo contendo todos os seus dados pessoais em formato
                  JSON, CSV ou PDF. O arquivo será enviado por e-mail em até 15 dias úteis.
                </p>

                <div className="space-y-2">
                  <p className="text-sm font-medium">O que será incluído:</p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>Dados cadastrais (e-mail, unidade, setor, cargo)</li>
                    <li>Histórico de respostas aos questionários</li>
                    <li>Scores e classificações calculadas</li>
                    <li>Metadados de consentimento LGPD</li>
                    <li>Logs de acesso (quando aplicável)</li>
                  </ul>
                </div>

                <Button
                  onClick={handleSolicitacaoPortabilidade}
                  disabled={solicitacaoEnviada}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {solicitacaoEnviada ? "Solicitação Enviada" : "Solicitar Portabilidade"}
                </Button>
              </CardContent>
            </Card>

            {/* Exclusão de Dados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Trash2 className="h-5 w-5" />
                  Exclusão de Dados
                </CardTitle>
                <CardDescription>
                  Solicitar exclusão dos seus dados pessoais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Atenção</AlertTitle>
                  <AlertDescription>
                    Esta ação é irreversível. Dados com obrigação legal de retenção (5 anos)
                    serão mantidos apenas pelo período mínimo exigido por lei.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="motivo-exclusao">Motivo da solicitação</Label>
                  <Textarea
                    id="motivo-exclusao"
                    placeholder="Por favor, descreva o motivo da solicitação de exclusão..."
                    value={solicitacaoMotivo}
                    onChange={(e) => setSolicitacaoMotivo(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button
                  onClick={handleSolicitacaoExclusao}
                  disabled={solicitacaoEnviada}
                  variant="destructive"
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {solicitacaoEnviada ? "Solicitação Enviada" : "Solicitar Exclusão"}
                </Button>
              </CardContent>
            </Card>

            {/* Correção de Dados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  Correção de Dados
                </CardTitle>
                <CardDescription>
                  Solicitar correção de dados incorretos ou desatualizados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Se você identificou algum dado incorreto, entre em contato com o RH da sua
                  organização para solicitar correção. Dados cadastrais (unidade, setor, cargo)
                  podem ser atualizados pela equipe de RH.
                </p>

                <Button variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Contatar RH
                </Button>
              </CardContent>
            </Card>

            {/* Informações sobre Tratamento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5" />
                  Informações sobre Tratamento
                </CardTitle>
                <CardDescription>
                  Obter informações sobre como seus dados são tratados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Você pode solicitar informações detalhadas sobre:
                </p>

                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Finalidade do tratamento dos seus dados</li>
                  <li>Categorias de dados tratados</li>
                  <li>Compartilhamento com terceiros</li>
                  <li>Medidas de segurança aplicadas</li>
                  <li>Período de retenção</li>
                </ul>

                <Button variant="outline" className="w-full">
                  <Info className="h-4 w-4 mr-2" />
                  Ver Informações Completas
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Histórico de Solicitações */}
        <TabsContent value="historico" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Histórico de Solicitações
              </CardTitle>
              <CardDescription>
                Acompanhe o status das suas solicitações LGPD
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Você ainda não fez nenhuma solicitação LGPD.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Quando você solicitar portabilidade ou exclusão de dados, o histórico
                  aparecerá aqui.
                </p>
              </div>

              {/* Exemplo de histórico (quando houver dados) */}
              {/* <div className="space-y-3">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">Portabilidade de Dados</h4>
                      <p className="text-sm text-muted-foreground">Solicitado em 10/01/2026</p>
                    </div>
                    <Badge>Em andamento</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sua solicitação está sendo processada. Você receberá os dados por e-mail
                    em até 15 dias úteis.
                  </p>
                </div>
              </div> */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
