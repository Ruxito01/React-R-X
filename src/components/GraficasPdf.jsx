import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';

// Componente Top 3 Usuarios para PDF (con fotos de perfil)
export const GraficasUsuariosPdf = ({ usuarios = [] }) => {
  // Top 3 usuarios por viajes
  const top3 = [...usuarios]
    .sort((a, b) => (b.rutasMes || 0) - (a.rutasMes || 0))
    .slice(0, 3);
  
  const alturas = [70, 100, 50];
  const colores = ['#C0C0C0', '#FFD700', '#CD7F32'];
  const posiciones = ['2', '1', '3'];
  
  // Reordenar para podio: 2do, 1ro, 3ro
  const ordenPodio = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;

  return (
    <div style={{ background: '#fff', padding: '20px' }}>
      {/* Solo Top 3 Usuarios con fotos */}
      <div id="pdf-grafica-usuarios-top" style={{ padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #eee' }}>
        <h4 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '16px', fontWeight: '700' }}>Top 3 Usuarios con Mas Viajes</h4>
        {top3.length > 0 ? (
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: '220px', gap: '20px' }}>
            {ordenPodio.map((usuario, i) => {
              if (!usuario) return null;
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '120px' }}>
                  {/* Foto de perfil */}
                  <div style={{
                    width: i === 1 ? '70px' : '55px',
                    height: i === 1 ? '70px' : '55px',
                    borderRadius: '50%',
                    border: `4px solid ${colores[i]}`,
                    background: colores[i],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    marginBottom: '8px',
                    boxShadow: i === 1 ? '0 4px 15px rgba(255, 215, 0, 0.4)' : '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    {usuario.foto ? (
                      <img 
                        src={usuario.foto} 
                        alt="" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <span style={{ 
                        fontSize: i === 1 ? '1.8rem' : '1.4rem', 
                        fontWeight: '700', 
                        color: '#fff' 
                      }}>
                        {usuario.nombre?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                  
                  {/* Nombre/Alias */}
                  <div style={{ 
                    fontSize: '13px', 
                    fontWeight: '600', 
                    textAlign: 'center', 
                    marginBottom: '4px',
                    color: '#333',
                    maxWidth: '100px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    @{usuario.alias || usuario.nombre?.split(' ')[0]}
                  </div>
                  
                  {/* Cantidad de viajes */}
                  <div style={{ 
                    fontSize: '12px', 
                    fontWeight: '700', 
                    color: '#FF6610', 
                    marginBottom: '8px' 
                  }}>
                    {usuario.rutasMes || 0} viajes
                  </div>
                  
                  {/* Barra del podio */}
                  <div style={{
                    width: '60px',
                    height: `${alturas[i]}px`,
                    background: `linear-gradient(180deg, ${colores[i]} 0%, ${colores[i]}99 100%)`,
                    borderRadius: '8px 8px 0 0',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    paddingTop: '8px'
                  }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff' }}>{posiciones[i]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: '#999', textAlign: 'center' }}>Sin usuarios</p>
        )}
      </div>
    </div>
  );
};

// Componente graficas de vehiculos para PDF
export const GraficasVehiculosPdf = ({ vehiculos = [] }) => {
  // Distribucion por tipo
  const distribucion = {};
  vehiculos.forEach(v => {
    const tipo = v.tipoVehiculo?.nombre || v.tipo || 'Sin tipo';
    distribucion[tipo] = (distribucion[tipo] || 0) + 1;
  });
  const total = vehiculos.length || 1;

  // Usuarios con mas vehiculos
  const usuarioCount = {};
  vehiculos.forEach(v => {
    if (v.usuario) {
      const userId = v.usuario.id;
      if (!usuarioCount[userId]) {
        usuarioCount[userId] = {
          nombre: v.usuario.nombre || 'Usuario',
          alias: v.usuario.alias || '',
          cantidad: 0
        };
      }
      usuarioCount[userId].cantidad++;
    }
  });
  const top5Usuarios = Object.values(usuarioCount)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5);

  return (
    <div style={{ background: '#fff', padding: '20px' }}>
      {/* Distribucion por tipo */}
      <div id="pdf-grafica-vehiculos-distribucion" style={{ marginBottom: '30px', padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #eee' }}>
        <h4 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '16px', fontWeight: '700' }}>Distribucion por Tipo de Vehiculo</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Object.entries(distribucion).map(([tipo, cantidad], i) => {
            const porcentaje = (cantidad / total) * 100;
            const colores = ['#FF6610', '#FF8844', '#FFB380', '#FFD4B8'];
            return (
              <div key={tipo}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#333' }}>{tipo}</span>
                  <span style={{ fontSize: '13px', color: colores[i % colores.length], fontWeight: '600' }}>{cantidad} ({porcentaje.toFixed(0)}%)</span>
                </div>
                <div style={{ width: '100%', height: '24px', background: '#f5f5f5', borderRadius: '6px' }}>
                  <div style={{
                    width: `${porcentaje}%`, height: '100%',
                    background: `linear-gradient(90deg, ${colores[i % colores.length]}, ${colores[i % colores.length]}cc)`,
                    borderRadius: '6px',
                    minWidth: '20px'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top usuarios con vehiculos */}
      <div id="pdf-grafica-vehiculos-podio" style={{ padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #eee' }}>
        <h4 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '16px', fontWeight: '700' }}>Usuarios con mas Vehiculos</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {top5Usuarios.map((u, i) => {
            const maxCant = top5Usuarios[0]?.cantidad || 1;
            const porcentaje = (u.cantidad / maxCant) * 100;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ width: '24px', fontWeight: '700', color: '#FF6610', fontSize: '14px' }}>{i + 1}</span>
                <span style={{ width: '100px', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  @{u.alias || u.nombre}
                </span>
                <div style={{ flex: 1, height: '22px', background: '#f0f0f0', borderRadius: '6px' }}>
                  <div style={{
                    width: `${porcentaje}%`, height: '100%',
                    background: 'linear-gradient(90deg, #FF6610, #FF8844)',
                    borderRadius: '6px',
                    minWidth: '30px'
                  }} />
                </div>
                <span style={{ width: '35px', textAlign: 'right', fontWeight: '700', fontSize: '14px' }}>{u.cantidad}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Componente graficas de rutas para PDF (usando Recharts)
export const GraficasRutasPdf = ({ rutas = [], viajes = [] }) => {
  // Top rutas mas activas
  const conteoRutas = viajes.reduce((acc, viaje) => {
    const rutaId = viaje.ruta?.id || viaje.rutaId;
    if (rutaId) acc[rutaId] = (acc[rutaId] || 0) + 1;
    return acc;
  }, {});

  const topRutasData = rutas.map(ruta => ({
    name: ruta.nombre?.substring(0, 12) || 'Ruta',
    viajes: conteoRutas[ruta.id] || 0
  })).sort((a, b) => b.viajes - a.viajes).slice(0, 5);

  // Tendencia de viajes por fecha
  const tendenciaData = (() => {
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
  })();

  // Estado de viajes (pie chart data)
  const estadoData = (() => {
    const conteo = viajes.reduce((acc, viaje) => {
      const estado = viaje.estado || 'desconocido';
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {});
    const COLORS = {
      'programado': '#2196F3',
      'en_curso': '#FF6610',
      'finalizado': '#4CAF50',
      'cancelado': '#F44336'
    };
    return Object.entries(conteo).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '),
      value,
      color: COLORS[key.toLowerCase()] || '#9e9e9e'
    }));
  })();

  return (
    <div style={{ background: '#fff', padding: '20px' }}>
      {/* Top Rutas */}
      <div id="pdf-grafica-rutas-top" style={{ marginBottom: '30px', padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #eee' }}>
        <h4 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '16px', fontWeight: '700' }}>Top Rutas Mas Activas</h4>
        <div style={{ height: '180px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topRutasData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="viajes" fill="#FF6610" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tendencia */}
      <div id="pdf-grafica-rutas-tendencia" style={{ marginBottom: '30px', padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #eee' }}>
        <h4 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '16px', fontWeight: '700' }}>Tendencia de Viajes</h4>
        <div style={{ height: '180px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={tendenciaData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorViajesPdf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2196F3" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#2196F3" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#2196F3" fillOpacity={1} fill="url(#colorViajesPdf)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Estado de Viajes - Pie Chart */}
      <div id="pdf-grafica-rutas-estado" style={{ padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #eee' }}>
        <h4 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '16px', fontWeight: '700' }}>Estado de Viajes</h4>
        <div style={{ height: '200px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={estadoData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {estadoData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// Componente graficas de comunidades para PDF
export const GraficasComunidadesPdf = ({ comunidades = [] }) => {
  // Distribucion por tamaño
  const peq = comunidades.filter(c => c.cantidadMiembros < 5).length;
  const med = comunidades.filter(c => c.cantidadMiembros >= 5 && c.cantidadMiembros <= 20).length;
  const gra = comunidades.filter(c => c.cantidadMiembros > 20).length;
  const total = comunidades.length || 1;

  const distribucionData = [
    { name: 'Pequeñas (<5)', value: peq, color: '#FFB74D' },
    { name: 'Medianas (5-20)', value: med, color: '#FB8C00' },
    { name: 'Grandes (>20)', value: gra, color: '#E65100' }
  ].filter(d => d.value > 0);

  // Top 5 comunidades por miembros
  const top5 = [...comunidades]
    .sort((a, b) => b.cantidadMiembros - a.cantidadMiembros)
    .slice(0, 5);
  const maxMiembros = top5[0]?.cantidadMiembros || 1;

  // Crecimiento (simulado por orden de creacion)
  const crecimientoData = comunidades
    .sort((a, b) => new Date(a.fechaCreacion || 0) - new Date(b.fechaCreacion || 0))
    .map((c, i) => ({
      name: `${i + 1}`,
      total: i + 1,
      comunidad: c.nombre
    }));

  return (
    <div style={{ background: '#fff', padding: '20px' }}>
      {/* Crecimiento de Comunidades */}
      <div id="pdf-grafica-comunidades-crecimiento" style={{ marginBottom: '30px', padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #eee' }}>
        <h4 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '16px', fontWeight: '700' }}>Crecimiento de Comunidades</h4>
        <div style={{ height: '180px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={crecimientoData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorCrecimiento" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6610" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#FF6610" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} label={{ value: 'Orden de creacion', position: 'bottom', fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div style={{ background: '#fff', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px' }}>
                      <p style={{ margin: 0, fontWeight: '600' }}>{payload[0].payload.comunidad}</p>
                      <p style={{ margin: 0, color: '#666' }}>Total acumulado: {payload[0].value}</p>
                    </div>
                  );
                }
                return null;
              }} />
              <Area type="monotone" dataKey="total" stroke="#FF6610" fillOpacity={1} fill="url(#colorCrecimiento)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ranking de Miembros */}
      <div id="pdf-grafica-comunidades-ranking" style={{ marginBottom: '30px', padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #eee' }}>
        <h4 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '16px', fontWeight: '700' }}>Ranking de Miembros (Top 5)</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {top5.map((c, i) => {
            const porcentaje = (c.cantidadMiembros / maxMiembros) * 100;
            const colores = ['#E65100', '#FB8C00', '#FF9800', '#FFB74D', '#FFCC80'];
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ width: '24px', fontWeight: '700', color: colores[i], fontSize: '14px' }}>{i + 1}</span>
                <span style={{ width: '120px', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '500' }}>
                  {c.nombre}
                </span>
                <div style={{ flex: 1, height: '24px', background: '#f0f0f0', borderRadius: '6px' }}>
                  <div style={{
                    width: `${porcentaje}%`, height: '100%',
                    background: `linear-gradient(90deg, ${colores[i]}, ${colores[i]}cc)`,
                    borderRadius: '6px',
                    minWidth: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: '8px'
                  }}>
                    <span style={{ color: '#fff', fontWeight: '700', fontSize: '12px' }}>{c.cantidadMiembros}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Distribucion por Tamaño */}
      <div id="pdf-grafica-comunidades-distribucion" style={{ padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #eee' }}>
        <h4 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '16px', fontWeight: '700' }}>Distribucion por Tamaño</h4>
        <div style={{ height: '200px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distribucionData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {distribucionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '24px', fontWeight: '800', color: '#333' }}>
          {total} <span style={{ fontSize: '14px', fontWeight: '500', color: '#666' }}>comunidades totales</span>
        </div>
      </div>
    </div>
  );
};
