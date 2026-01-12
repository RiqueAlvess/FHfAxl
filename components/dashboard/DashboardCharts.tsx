"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

interface DashboardData {
  kAnonymity: boolean;
  kpis: {
    totalColaboradores: number;
    taxaAdesao: number;
    indiceGeralRisco: number;
    scoreMediano: number;
    desvioPadrao: number;
    coeficienteVariacao: number;
    taxaRiscoAlto: number;
    tempoMedioResposta: number;
    numeroQuestoesCriticas: number;
  };
  distribuicao: {
    satisfatorio: number;
    atencao: number;
    critico: number;
  };
  scoresDimensoes: Array<{
    dimensao: string;
    scoreMedio: number;
    desvioPadrao: number;
  }>;
}

const COLORS = {
  satisfatorio: "#22c55e",
  atencao: "#eab308",
  critico: "#ef4444",
  primary: "#3b82f6",
  secondary: "#8b5cf6",
};

export default function DashboardCharts() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/dashboard/analytics");
      const result = await response.json();

      if (!response.ok) {
        if (result.kAnonymity === false) {
          setError(result.message);
        } else if (result.message) {
          setError(result.message);
        } else {
          throw new Error(result.error || "Erro ao carregar dados");
        }
      } else {
        setData(result);
      }
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
      toast.error("Erro ao carregar dashboard");
      setError("Erro ao carregar dados do dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Carregando dados...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
            <p className="text-gray-600 mb-2">
              {error || "Configure o sistema e envie questionários para visualizar análises"}
            </p>
            {error?.includes("K-Anonymity") && (
              <p className="text-sm text-gray-500">
                Mínimo de 5 respondentes necessário para proteção de dados (LGPD)
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Verificar se todos os dados necessários estão disponíveis
  if (!data.distribuicao || !data.scoresDimensoes || !data.kpis) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
            <p className="text-gray-600 mb-2">
              Dados incompletos. Por favor, atualize a página ou entre em contato com o suporte.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Preparar dados para gráficos
  const distribuicaoData = [
    { name: "Satisfatório", value: data.distribuicao.satisfatorio, color: COLORS.satisfatorio },
    { name: "Atenção", value: data.distribuicao.atencao, color: COLORS.atencao },
    { name: "Crítico", value: data.distribuicao.critico, color: COLORS.critico },
  ];

  const radarData = data.scoresDimensoes.map((d) => ({
    dimensao: d.dimensao.split(" ")[0], // Primeira palavra para caber no gráfico
    score: d.scoreMedio,
    fullMax: 20,
  }));

  return (
    <div className="space-y-6">
      {/* KPIs Estatísticos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Mediana do Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.kpis.scoreMediano}</div>
            <p className="text-xs text-gray-500">Valor central da distribuição</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Desvio Padrão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.kpis.desvioPadrao}</div>
            <p className="text-xs text-gray-500">Dispersão dos scores</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Coef. Variação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.kpis.coeficienteVariacao}%</div>
            <p className="text-xs text-gray-500">Variabilidade relativa</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Principais */}
      <Tabs defaultValue="distribuicao" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="distribuicao">Distribuição de Risco</TabsTrigger>
          <TabsTrigger value="dimensoes">Análise por Dimensão</TabsTrigger>
          <TabsTrigger value="radar">Radar de Riscos</TabsTrigger>
        </TabsList>

        <TabsContent value="distribuicao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Risco</CardTitle>
              <CardDescription>
                Classificação dos respondentes por nível de risco psicossocial
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pizza Chart */}
                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={distribuicaoData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {distribuicaoData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Barras */}
                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={distribuicaoData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill={COLORS.primary}>
                        {distribuicaoData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">
                    {data.distribuicao.satisfatorio}
                  </div>
                  <div className="text-sm text-green-600">Satisfatório</div>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-700">
                    {data.distribuicao.atencao}
                  </div>
                  <div className="text-sm text-yellow-600">Atenção</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-700">
                    {data.distribuicao.critico}
                  </div>
                  <div className="text-sm text-red-600">Crítico</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dimensoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pontuação Média por Dimensão</CardTitle>
              <CardDescription>
                Score médio (0-20) para cada dimensão do questionário HSE-IT
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.scoresDimensoes} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 20]} />
                  <YAxis dataKey="dimensao" type="category" width={120} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="scoreMedio" fill={COLORS.primary} name="Score Médio" />
                </BarChart>
              </ResponsiveContainer>

              {/* Alertas por dimensão */}
              <div className="mt-4 space-y-2">
                {data.scoresDimensoes
                  .filter((d) => d.scoreMedio > 15)
                  .map((d) => (
                    <div key={d.dimensao} className="flex items-center gap-2 p-2 bg-red-50 rounded">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-700">
                        <strong>{d.dimensao}</strong> apresenta score crítico ({d.scoreMedio})
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="radar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Radar de Dimensões</CardTitle>
              <CardDescription>Visão 360° dos riscos psicossociais por dimensão</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="dimensao" />
                  <PolarRadiusAxis angle={90} domain={[0, 20]} />
                  <Radar
                    name="Score Médio"
                    dataKey="score"
                    stroke={COLORS.primary}
                    fill={COLORS.primary}
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>

              <div className="mt-4 text-sm text-gray-600">
                <p>
                  <strong>Interpretação:</strong> Scores mais altos indicam maior risco
                  psicossocial. Valores acima de 15 requerem atenção imediata.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Indicadores Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Taxa de Risco Alto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-red-600">{data.kpis.taxaRiscoAlto}%</div>
            <p className="text-sm text-gray-500 mt-2">
              Percentual de respondentes em nível crítico
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tempo Médio de Resposta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">
              {Math.floor(data.kpis.tempoMedioResposta / 60)}m {data.kpis.tempoMedioResposta % 60}s
            </div>
            <p className="text-sm text-gray-500 mt-2">Duração média do questionário</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
