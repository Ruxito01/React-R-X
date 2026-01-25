import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import './EstadisticasRutas.css';

// 1. Gráfico Top 3 Rutas
export const GraficoTopRutas = ({ rutas = [], viajes = [] }) => {
  const data = useMemo(() => {
    if (!rutas.length || !viajes.length) return [];
    
    const conteo = viajes.reduce((acc, viaje) => {
      const rutaId = viaje.ruta?.id || viaje.rutaId;
      if (rutaId) acc[rutaId] = (acc[rutaId] || 0) + 1;
      return acc;
    }, {});

    const chartData = rutas.map(ruta => ({
      name: ruta.nombre,
      viajes: conteo[ruta.id] || 0,
      color: '#FF6610'
    }));

    return chartData.sort((a, b) => b.viajes - a.viajes).slice(0, 3);
  }, [rutas, viajes]);

  return (
    <div className="grafico-card individual" id="grafica-rutas-top">
      <h4>Top Rutas concurridas</h4>
      <div className="grafico-wrapper mini">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} height={30} />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px' }} />
            <Bar dataKey="viajes" name="Viajes" fill="#FF6610" radius={[4, 4, 0, 0]} barSize={30}>
              {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// 2. Gráfico Tendencia de Viajes
export const GraficoTendencia = ({ viajes = [] }) => {
  const data = useMemo(() => {
    if (!viajes.length) return [];

    const sortedViajes = [...viajes].filter(v => v.fechaProgramada).sort((a, b) => 
      new Date(a.fechaProgramada) - new Date(b.fechaProgramada)
    );
    
    const orderedMap = new Map();
    sortedViajes.forEach(v => {
      const d = new Date(v.fechaProgramada);
      const key = `${d.getDate()}/${d.getMonth()+1}`;
      orderedMap.set(key, (orderedMap.get(key) || 0) + 1);
    });

    return Array.from(orderedMap).map(([name, count]) => ({ name, count }));
  }, [viajes]);

  return (
    <div className="grafico-card individual" id="grafica-rutas-tendencia">
      <h4>Tendencia de Viajes</h4>
      <div className="grafico-wrapper mini">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorViajes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2196F3" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#2196F3" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px' }} />
            <Area type="monotone" dataKey="count" name="Viajes" stroke="#2196F3" fillOpacity={1} fill="url(#colorViajes)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// 3. Gráfico Estado de Viajes
export const GraficoEstado = ({ viajes = [] }) => {
  const data = useMemo(() => {
    if (!viajes.length) return [];
    
    const conteo = viajes.reduce((acc, viaje) => {
      const estado = viaje.estado || 'Desconocido';
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {});

    const COLORS = {
      'programado': '#2196F3',
      'en_curso': '#FF6610',
      'finalizado': '#4CAF50',
      'cancelado': '#F44336',
      'Desconocido': '#9e9e9e'
    };

    return Object.keys(conteo).map(key => ({
      name: key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '),
      value: conteo[key],
      color: COLORS[key.toLowerCase()] || COLORS['Desconocido']
    }));
  }, [viajes]);

  return (
    <div className="grafico-card individual" id="grafica-rutas-estado">
      <h4>Estado de Viajes</h4>
      <div className="grafico-wrapper mini">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={60}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px' }} />
            <Legend verticalAlign="bottom" align="center" iconSize={8} wrapperStyle={{ fontSize: '10px' }}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const EstadisticasRutas = () => {
  return null; // Deprecated default export
};

export default EstadisticasRutas;
