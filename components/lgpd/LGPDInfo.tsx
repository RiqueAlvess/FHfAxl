"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, Eye, Lock, FileText, UserCheck, Clock, Database, AlertTriangle } from "lucide-react";

/**
 * Componente de Informações LGPD
 *
 * Exibe política de privacidade, termos de uso e explicações
 * sobre K-Anonymity e proteção de dados do VIVAMENTE360.
 */
export function LGPDInfo() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Privacidade e Proteção de Dados</h1>
        <p className="text-muted-foreground mt-2">
          Entenda como o VIVAMENTE360 protege seus dados em conformidade com a LGPD
        </p>
      </div>

      <Tabs defaultValue="privacidade" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="privacidade">Política de Privacidade</TabsTrigger>
          <TabsTrigger value="k-anonymity">K-Anonymity</TabsTrigger>
          <TabsTrigger value="direitos">Seus Direitos</TabsTrigger>
          <TabsTrigger value="dpo">Contato DPO</TabsTrigger>
        </TabsList>

        {/* Política de Privacidade */}
        <TabsContent value="privacidade" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Política de Privacidade
              </CardTitle>
              <CardDescription>
                Como coletamos, usamos e protegemos seus dados pessoais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <section>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Dados Coletados
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  O VIVAMENTE360 coleta os seguintes dados:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Respostas ao questionário HSE-IT (35 perguntas sobre ambiente de trabalho)</li>
                  <li>Dados demográficos básicos (unidade, setor, cargo)</li>
                  <li>Data e hora da resposta</li>
                  <li>Tempo de conclusão do questionário</li>
                  <li>Consentimento LGPD e metadados associados</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Finalidade do Tratamento
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Seus dados são utilizados exclusivamente para:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Avaliar riscos psicossociais no ambiente de trabalho</li>
                  <li>Gerar relatórios agregados e anônimos conforme NR-1</li>
                  <li>Atender obrigações legais de segurança ocupacional</li>
                  <li>Propor melhorias no ambiente organizacional</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Proteção de Dados
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Implementamos medidas técnicas e organizacionais para proteger seus dados:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>K-Anonymity (K=5):</strong> Dados só são exibidos quando há no mínimo 5 respondentes no grupo</li>
                  <li><strong>Criptografia:</strong> Dados armazenados com criptografia em banco PostgreSQL</li>
                  <li><strong>Anonimização:</strong> Respostas individuais não podem ser identificadas</li>
                  <li><strong>Controle de Acesso:</strong> Apenas pessoal autorizado (RH e Liderança) tem acesso aos dados agregados</li>
                  <li><strong>Logs de Auditoria:</strong> Todas as visualizações e exportações são registradas</li>
                  <li><strong>Magic Links:</strong> Links únicos e temporários (expiram em 48 horas)</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Retenção de Dados
                </h3>
                <p className="text-sm text-muted-foreground">
                  Seus dados são mantidos por <strong>5 anos</strong> a partir da última resposta, conforme
                  exigências legais trabalhistas e de segurança ocupacional. Após esse período, os dados
                  são anonimizados permanentemente ou excluídos, mantendo-se apenas estatísticas agregadas.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Base Legal (LGPD)
                </h3>
                <p className="text-sm text-muted-foreground">
                  O tratamento de seus dados é baseado em:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Consentimento:</strong> Você consente explicitamente ao responder o questionário</li>
                  <li><strong>Obrigação Legal:</strong> NR-1 e legislação trabalhista brasileira</li>
                  <li><strong>Interesse Legítimo:</strong> Promoção de ambiente de trabalho saudável</li>
                </ul>
              </section>
            </CardContent>
          </Card>
        </TabsContent>

        {/* K-Anonymity */}
        <TabsContent value="k-anonymity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                O que é K-Anonymity?
              </CardTitle>
              <CardDescription>
                Entenda como garantimos sua privacidade através de K-Anonymity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Proteção K-Anonymity (K=5)</AlertTitle>
                <AlertDescription>
                  No VIVAMENTE360, usamos K-Anonymity com K=5, o que significa que seus dados
                  só são exibidos em relatórios quando há pelo menos <strong>5 respondentes</strong> no
                  grupo analisado. Isso torna impossível identificar respostas individuais.
                </AlertDescription>
              </Alert>

              <section>
                <h3 className="font-semibold text-lg mb-2">Como Funciona?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  K-Anonymity é um conceito de privacidade que garante que cada registro em um
                  conjunto de dados não pode ser distinguido de pelo menos K-1 outros registros.
                </p>

                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <h4 className="font-medium">Exemplo Prático:</h4>
                  <p className="text-sm">
                    Se um relatório filtra por "Setor de TI" e há apenas 3 colaboradores nesse setor,
                    o sistema <strong>bloqueia</strong> a visualização dos dados para proteger a identidade
                    dos respondentes. Só quando houver 5 ou mais respostas, os dados agregados serão exibidos.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">Benefícios para Você</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>
                    <strong>Anonimato Garantido:</strong> Sua resposta individual nunca pode ser identificada
                  </li>
                  <li>
                    <strong>Impossível Triangulação:</strong> Mesmo com múltiplos filtros, mantém-se proteção
                  </li>
                  <li>
                    <strong>Conformidade LGPD:</strong> Atende artigos 46 e 49 sobre segurança de dados
                  </li>
                  <li>
                    <strong>Transparência:</strong> Você sabe exatamente quando e por que dados são bloqueados
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">Quando K-Anonymity se Aplica</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  A verificação K-Anonymity é aplicada em:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Dashboards de analytics e visualizações</li>
                  <li>Relatórios executivos e completos</li>
                  <li>Exportações em PDF e Excel</li>
                  <li>Qualquer visualização filtrada por unidade, setor, cargo ou ciclo</li>
                </ul>
              </section>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Direitos do Titular */}
        <TabsContent value="direitos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Seus Direitos sob a LGPD
              </CardTitle>
              <CardDescription>
                Conheça e exerça seus direitos como titular de dados pessoais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Importante</AlertTitle>
                <AlertDescription>
                  Para exercer seus direitos, acesse a página de{" "}
                  <a href="/lgpd" className="underline font-medium">
                    Direitos do Titular
                  </a>{" "}
                  ou entre em contato com o DPO da sua organização.
                </AlertDescription>
              </Alert>

              <section>
                <h3 className="font-semibold text-lg mb-3">Direitos Garantidos pela LGPD</h3>

                <div className="space-y-4">
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-medium mb-1">1. Direito de Acesso (Art. 18, I e II)</h4>
                    <p className="text-sm text-muted-foreground">
                      Você pode solicitar confirmação de que tratamos seus dados e acessar
                      todas as informações que temos sobre você.
                    </p>
                  </div>

                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-medium mb-1">2. Direito de Correção (Art. 18, III)</h4>
                    <p className="text-sm text-muted-foreground">
                      Você pode solicitar correção de dados incompletos, inexatos ou desatualizados.
                    </p>
                  </div>

                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-medium mb-1">3. Direito de Portabilidade (Art. 18, V)</h4>
                    <p className="text-sm text-muted-foreground">
                      Você pode solicitar seus dados em formato estruturado (JSON, CSV, PDF)
                      para transferência a outro fornecedor.
                    </p>
                  </div>

                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-medium mb-1">4. Direito de Eliminação (Art. 18, VI)</h4>
                    <p className="text-sm text-muted-foreground">
                      Você pode solicitar exclusão de seus dados, exceto quando houver obrigação legal
                      de retenção (ex: 5 anos para dados trabalhistas).
                    </p>
                  </div>

                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-medium mb-1">5. Direito de Informação (Art. 18, VII e VIII)</h4>
                    <p className="text-sm text-muted-foreground">
                      Você pode saber com quais entidades públicas ou privadas compartilhamos seus dados
                      e obter informações sobre a possibilidade de não fornecer consentimento.
                    </p>
                  </div>

                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-medium mb-1">6. Direito de Revogação (Art. 18, IX)</h4>
                    <p className="text-sm text-muted-foreground">
                      Você pode revogar seu consentimento a qualquer momento, embora isso não afete
                      tratamentos realizados anteriormente com base legal válida.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mt-6">
                <h3 className="font-semibold text-lg mb-2">Como Exercer Seus Direitos</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Para exercer qualquer um desses direitos:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Acesse a página de Direitos do Titular no menu da plataforma</li>
                  <li>Selecione o direito que deseja exercer</li>
                  <li>Preencha o formulário com sua solicitação</li>
                  <li>Aguarde resposta em até 15 dias úteis</li>
                </ol>
              </section>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contato DPO */}
        <TabsContent value="dpo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Encarregado de Dados (DPO)
              </CardTitle>
              <CardDescription>
                Entre em contato com o Encarregado de Proteção de Dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Data Protection Officer (DPO)</AlertTitle>
                <AlertDescription>
                  O DPO é o profissional responsável por garantir a conformidade com a LGPD
                  e atender solicitações relacionadas à proteção de dados pessoais.
                </AlertDescription>
              </Alert>

              <section>
                <h3 className="font-semibold text-lg mb-3">Como Contatar o DPO</h3>

                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <div>
                    <p className="text-sm font-medium">Canal de Atendimento LGPD</p>
                    <p className="text-sm text-muted-foreground">
                      Entre em contato com o setor de RH da sua organização para ser
                      direcionado ao Encarregado de Dados.
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Prazo de Resposta</p>
                    <p className="text-sm text-muted-foreground">
                      Conforme LGPD Art. 18, §3º, responderemos sua solicitação em até{" "}
                      <strong>15 dias úteis</strong>.
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Solicitações Atendidas</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                      <li>Dúvidas sobre tratamento de dados</li>
                      <li>Exercício de direitos LGPD</li>
                      <li>Reclamações sobre privacidade</li>
                      <li>Solicitação de relatório de impacto</li>
                      <li>Informações sobre compartilhamento de dados</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">Autoridade Nacional</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Caso não esteja satisfeito com a resposta do DPO, você pode contatar a
                  Autoridade Nacional de Proteção de Dados (ANPD):
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm">
                    <strong>ANPD - Autoridade Nacional de Proteção de Dados</strong>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Website:{" "}
                    <a
                      href="https://www.gov.br/anpd"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      www.gov.br/anpd
                    </a>
                  </p>
                </div>
              </section>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
