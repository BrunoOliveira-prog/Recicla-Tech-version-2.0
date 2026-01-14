import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Dados simulados para o breakdown de materiais
// Em produção, isso viria da API
const data = [
    { name: 'Plástico', value: 450, color: '#10b981' }, // primary
    { name: 'Metal', value: 300, color: '#06b6d4' },    // secondary/cyan
    { name: 'Papel', value: 200, color: '#3b82f6' },    // blue
    { name: 'Vidro', value: 150, color: '#ec4899' },    // pink/accent
    { name: 'Eletrônicos', value: 100, color: '#8b5cf6' } // purple
];

const renderActiveShape = (props: any) => {
    return props.payload.payload.name;
};

export function MaterialDonutChart() {
    const totalWeight = data.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <Card className="glass-card h-full flex flex-col border-none">
            <CardHeader className="items-center pb-0">
                <CardTitle className="text-xl font-heading font-bold uppercase tracking-wider">Materiais Coletados</CardTitle>
                <CardDescription className="text-sm font-body">Distribuição por tipo de resíduo</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-[300px] relative">
                {/* Central Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                    <span className="text-4xl font-heading font-black text-foreground">{totalWeight / 1000}T</span>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground font-body">Total Estimado</span>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={80}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={8}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} className="stroke-background hover:opacity-80 transition-opacity" strokeWidth={2} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                borderRadius: '12px',
                                border: '1px solid hsl(var(--border))',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                            itemStyle={{ color: 'hsl(var(--foreground))', fontFamily: 'Roboto' }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value) => <span className="text-sm font-body text-muted-foreground ml-1">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
