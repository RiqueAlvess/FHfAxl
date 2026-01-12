"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";

// Importar apenas componentes críticos (above-the-fold)
import KPICards from "./KPICards";

// Lazy loading de charts pesados - carregam apenas quando necessário
const DistribuicaoRiscoChart = dynamic(() => import("./DistribuicaoRiscoChart"), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});

const HistogramaScoresChart = dynamic(() => import("./HistogramaScoresChart"), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});

const BoxPlotChart = dynamic(() => import("./BoxPlotChart"), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});

const DimensoesChart = dynamic(() => import("./DimensoesChart"), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});

const RadarDimensoesChart = dynamic(() => import("./RadarDimensoesChart"), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});

const VariabilidadeDimensoesChart = dynamic(() => import("./VariabilidadeDimensoesChart"), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});

const ConsistenciaInternaChart = dynamic(() => import("./ConsistenciaInternaChart"), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});

const DistribuicaoRespostasChart = dynamic(() => import("./DistribuicaoRespostasChart"), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});

const InsightsPanel = dynamic(() => import("./InsightsPanel"), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});

// Skeleton para loading dos charts
function ChartSkeleton() {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="pt-6">
        <div className="h-80 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
        </div>
      </CardContent>
    </Card>
  );
}

interface DashboardData {
  kAnonymity: boolean;
  kpis: any;
  distribuicao: any;
  scoresDimensoes: any[];
  // Dados adicionais que serão implementados
  histograma?: any;
  boxplot?: any;
  heatmap?: any;
  perguntas?: any[];
  perguntasCriticas?: any[];
  perguntasPositivas?: any[];
  correlacaoTempo?: any;
  evolucaoTemporal?: any[];
  comparativoUnidades?: any[];
  distribuicaoRespostas?: any[];
  insights?: any;
}

export default function DashboardCompleto() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/dashboard/analytics");
      const result = await response.json();

      if (!response.ok) {
        if (result.kAnonymity === false) {
          setError(result.message);
        } else {
          throw new Error(result.error || "Erro ao carregar dados");
        }
      } else {
        setData(result);
      }
    } catch (err) {
      toast.error("Erro ao carregar dashboard");
      setError("Erro ao carregar dados do dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-violet-500 animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
            <p className="text-zinc-400 mb-2">
              {error || "Configure o sistema e envie questionários para visualizar análises"}
            </p>
            {error?.includes("K-Anonymity") && (
              <p className="text-sm text-zinc-500">
                Mínimo de 5 respondentes necessário para proteção de dados (LGPD)
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Dados mockados para componentes que ainda não têm API
  // TODO: Integrar com API real quando as funções estiverem prontas
  const mockHistograma = [
    { faixa: "0-14", frequencia: 2, percentual: 10, rangeStart: 0, rangeEnd: 14 },
    { faixa: "15-28", frequencia: 5, percentual: 25, rangeStart: 15, rangeEnd: 28 },
    { faixa: "29-42", frequencia: 8, percentual: 40, rangeStart: 29, rangeEnd: 42 },
    { faixa: "43-56", frequencia: 3, percentual: 15, rangeStart: 43, rangeEnd: 56 },
    { faixa: "57-70", frequencia: 2, percentual: 10, rangeStart: 57, rangeEnd: 70 },
  ];

  const mockBoxplot = {
    min: 10,
    q1: 25,
    mediana: data.kpis.scoreMediano,
    q3: 55,
    max: 75,
    outliers: [5, 85],
    iqr: 30,
    mean: data.kpis.indiceGeralRisco,
  };

  const mockDimensoesComPolaridade = data.scoresDimensoes.map((d: any) => ({
    ...d,
    polaridade: d.dimensao.includes("Demandas") || d.dimensao.includes("Relacionamentos") ? "negativa" : "positiva",
  }));

  const mockHeatmap = {
    heatmap: [],
    dimensoes: data.scoresDimensoes.map((d: any) => d.dimensao),
    faixas: ["0-40", "41-80", "81-140"],
  };

  const mockDistribuicaoRespostas = [
    { valor: 0, rotulo: "Nunca", frequencia: 50, percentual: 20 },
    { valor: 1, rotulo: "Raramente", frequencia: 70, percentual: 28 },
    { valor: 2, rotulo: "Às vezes", frequencia: 80, percentual: 32 },
    { valor: 3, rotulo: "Frequentemente", frequencia: 35, percentual: 14 },
    { valor: 4, rotulo: "Sempre", frequencia: 15, percentual: 6 },
  ];

  const mockInsights = {
    resumoExecutivo: "Com base na análise dos dados coletados, observa-se um índice geral de risco de " + data.kpis.indiceGeralRisco.toFixed(1) + " pontos. A taxa de adesão ao questionário foi de " + data.kpis.taxaAdesao.toFixed(1) + "%, indicando uma boa participação dos colaboradores na avaliação.",
    alertas: data.kpis.taxaRiscoAlto > 30 ? [{
      tipo: "critico" as const,
      titulo: "Alta taxa de risco crítico",
      descricao: `${data.kpis.taxaRiscoAlto.toFixed(1)}% dos respondentes estão em nível de risco crítico, acima do limite aceitável de 30%.`,
      prioridade: 9,
    }] : [],
    recomendacoes: [],
    pontosFortes: data.scoresDimensoes
      .filter((d: any) => d.scoreMedio < 10)
      .map((d: any) => `${d.dimensao} apresenta scores favoráveis (${d.scoreMedio.toFixed(1)})`)
      .slice(0, 3),
    areasPreocupacao: data.scoresDimensoes
      .filter((d: any) => d.scoreMedio > 15)
      .map((d: any) => `${d.dimensao} apresenta scores elevados (${d.scoreMedio.toFixed(1)})`)
      .slice(0, 3),
  };

  return (
    <div className="space-y-6">
      {/* KPIs Cards */}
      <KPICards kpis={{...data.kpis, scoreMedioTotal: data.kpis.indiceGeralRisco}} />

      {/* Tabs para organizar os gráficos */}
      <Tabs defaultValue="visao-geral" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="dimensoes">Dimensões</TabsTrigger>
          <TabsTrigger value="perguntas">Perguntas</TabsTrigger>
          <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Tab: Visão Geral */}
        <TabsContent value="visao-geral" className="space-y-6">
          <DistribuicaoRiscoChart distribuicao={data.distribuicao} />
          <HistogramaScoresChart histograma={mockHistograma} />
          <BoxPlotChart boxplot={mockBoxplot} />
        </TabsContent>

        {/* Tab: Dimensões */}
        <TabsContent value="dimensoes" className="space-y-6">
          <DimensoesChart dimensoes={mockDimensoesComPolaridade} />
          <RadarDimensoesChart
            dimensoes={data.scoresDimensoes.map((d: any) => ({
              dimensao: d.dimensao,
              score: d.scoreMedio,
              max: 20,
              polaridade: d.dimensao.includes("Demandas") || d.dimensao.includes("Relacionamentos") ? "negativa" : "positiva",
            }))}
          />
          <VariabilidadeDimensoesChart
            dimensoes={data.scoresDimensoes.map((d: any) => ({
              dimensao: d.dimensao,
              desvioPadrao: d.desvioPadrao,
              coeficienteVariacao: (d.desvioPadrao / d.scoreMedio) * 100,
              scoreMedio: d.scoreMedio,
            }))}
          />
          <ConsistenciaInternaChart
            dimensoes={data.scoresDimensoes.map((d: any) => ({
              dimensao: d.dimensao,
              scoreMedio: d.scoreMedio,
              desvioPadrao: d.desvioPadrao,
              coeficienteVariacao: (d.desvioPadrao / d.scoreMedio) * 100,
            }))}
          />
        </TabsContent>

        {/* Tab: Perguntas */}
        <TabsContent value="perguntas" className="space-y-6">
          <DistribuicaoRespostasChart distribuicao={mockDistribuicaoRespostas} />
          {/* Nota: Estes componentes precisarão de dados reais da API */}
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg text-center">
            <p className="text-zinc-400">
              Análises detalhadas por pergunta serão exibidas aqui quando os dados estiverem disponíveis.
            </p>
          </div>
        </TabsContent>

        {/* Tab: Estatísticas */}
        <TabsContent value="estatisticas" className="space-y-6">
          {/* Nota: Estes componentes precisarão de dados reais da API */}
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg text-center">
            <p className="text-zinc-400">
              Análises estatísticas avançadas serão exibidas aqui quando os dados estiverem disponíveis.
            </p>
            <p className="text-sm text-zinc-500 mt-2">
              Correlações, evolução temporal e comparativos entre unidades.
            </p>
          </div>
        </TabsContent>

        {/* Tab: Insights */}
        <TabsContent value="insights" className="space-y-6">
          <InsightsPanel insights={mockInsights} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
