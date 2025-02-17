
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const fetchStockData = async (quote: string) => {

  const response = await fetch(`https://computress.up.railway.app/v1/ticket?quote=${quote}`);
  const data = await response.json();

  if (!response.ok) {
    console.log(data)
    throw new Error(data.message);
  }

  return data;
};

const Index = () => {
  const [quote, setQuote] = useState("");
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["stockData", quote],
    queryFn: () => fetchStockData(quote),
    enabled: false,
    retry: 1,
  });

  const handleAnalyze = async () => {
    if (!quote) {
      toast({
        title: "Atenção",
        description: "Por favor, insira o código da ação",
        variant: "destructive",
      });
      return;
    }
    refetch();
  };

  const handleDownload = () => {
    if (!data) return;
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `${quote.toLowerCase()}_analysis.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Sucesso",
      description: "Arquivo JSON baixado com sucesso",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Análise de Ativos Digitais</h1>
          <p className="text-gray-600">Insira o código do ativo para visualizar a previsão de preços</p>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700">
              Importante: Criptomoedas são listadas com pares. Por exemplo, para prever o preço do bitcoin, use BTC-USD.
              Caso você use apenas BTC, o valor será relacionado ao ETF dele.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 grid grid-cols-1 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center justify-center">
              <div className="w-full space-y-4">
                <label className="block text-sm font-medium text-gray-700 text-center">
                  Código do Ativo
                </label>
                <Input
                  placeholder="Ex: BTC-USD"
                  value={quote}
                  onChange={(e) => setQuote(e.target.value.toUpperCase())}
                  className="w-full"
                />
                <Button
                  onClick={handleAnalyze}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? "Analisando..." : "Analisar"}
                </Button>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center justify-center">
              <div className="w-full">
                <Button
                  onClick={handleDownload}
                  className="w-full bg-green-600 hover:bg-green-700 transition-colors"
                  disabled={!data || data.length === 0}
                >
                  Baixar dados completo
                </Button>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm">
            {error ? (
              <div className="text-center text-red-500 py-8">
                {error instanceof Error ? error.message : "Ocorreu um erro ao buscar os dados. Por favor, tente novamente."}
              </div>
            ) : data && data.length > 0 ? (
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <XAxis
                      dataKey="time"
                      stroke="#6B7280"
                      tick={{ fill: "#6B7280" }}
                    />
                    <YAxis
                      stroke="#6B7280"
                      tick={{ fill: "#6B7280" }}
                      domain={["auto", "auto"]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #E5E7EB",
                        borderRadius: "0.375rem",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#4F46E5"
                      strokeWidth={2}
                      dot={false}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Insira um código de ativo e clique em analisar para ver o gráfico
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
