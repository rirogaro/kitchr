import { useState, useEffect } from 'react'

const API_URL = 'https://kitchr-pos.onrender.com/api'

function App() {
  const [vista, setVista] = useState('mesas')
  const [mesas, setMesas] = useState([])
  const [reservas, setReservas] = useState([])
  const [listaEspera, setListaEspera] = useState([])
  const [fechaSel, setFechaSel] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)

  // Forms
  const [nuevaMesa, setNuevaMesa] = useState({ numero: '', capacidad: 4, zona: '' })
  const [nuevaReserva, setNuevaReserva] = useState({ clienteNombre: '', clienteTelefono: '', fecha: fechaSel, hora: '14:00', numPersonas: 2 })
  const [nuevoEspera, setNuevoEspera] = useState({ clienteNombre: '', clienteTelefono: '', numPersonas: 2 })

  useEffect(() => { cargarMesas(); cargarReservas(); cargarEspera() }, [])
  useEffect(() => { cargarReservasFecha() }, [fechaSel])

  const cargarMesas = async () => {
    const res = await fetch(`${API_URL}/mesas`)
    const data = await res.json()
    if (data.success) setMesas(data.data)
  }

  const cargarReservas = async () => {
    const res = await fetch(`${API_URL}/reservas`)
    const data = await res.json()
    if (data.success) setReservas(data.data)
  }

  const cargarReservasFecha = async () => {
    const res = await fetch(`${API_URL}/reservas/fecha/${fechaSel}`)
    const data = await res.json()
    if (data.success) setReservas(data.data)
  }

  const cargarEspera = async () => {
    const res = await fetch(`${API_URL}/lista-espera`)
    const data = await res.json()
    if (data.success) setListaEspera(data.data)
  }

  const crearMesa = async (e) => {
    e.preventDefault()
    setLoading(true)
    await fetch(`${API_URL}/mesas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevaMesa)
    })
    setNuevaMesa({ numero: '', capacidad: 4, zona: '' })
    await cargarMesas()
    setLoading(false)
  }

  const crearReserva = async (e) => {
    e.preventDefault()
    setLoading(true)
    await fetch(`${API_URL}/reservas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevaReserva)
    })
    setNuevaReserva({ clienteNombre: '', clienteTelefono: '', fecha: fechaSel, hora: '14:00', numPersonas: 2 })
    await cargarReservasFecha()
    setLoading(false)
  }

  const confirmarReserva = async (id) => {
    await fetch(`${API_URL}/reservas/${id}/confirmar`, { method: 'POST' })
    cargarReservasFecha()
  }

  const cancelarReserva = async (id) => {
    await fetch(`${API_URL}/reservas/${id}/cancelar`, { method: 'POST' })
    cargarReservasFecha()
  }

  const agregarEspera = async (e) => {
    e.preventDefault()
    setLoading(true)
    await fetch(`${API_URL}/lista-espera`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoEspera)
    })
    setNuevoEspera({ clienteNombre: '', clienteTelefono: '', numPersonas: 2 })
    await cargarEspera()
    setLoading(false)
  }

  const notificarEspera = async (id) => {
    await fetch(`${API_URL}/lista-espera/${id}/notificar`, { method: 'POST' })
    cargarEspera()
  }

  const sentarEspera = async (id) => {
    await fetch(`${API_URL}/lista-espera/${id}/sentar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mesaId: 1 })
    })
    cargarEspera()
  }

  const cancelarEspera = async (id) => {
    await fetch(`${API_URL}/lista-espera/${id}/cancelar`, { method: 'POST' })
    cargarEspera()
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-emerald-600 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">🍽️ Restaurant Manager</h1>
          <div className="flex gap-2">
            {['mesas', 'reservas', 'espera'].map(v => (
              <button key={v} onClick={() => setVista(v)}
                className={`px-4 py-2 rounded ${vista === v ? 'bg-white text-emerald-600' : 'bg-emerald-700'}`}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        {/* MESAS */}
        {vista === 'mesas' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold mb-4">Nueva Mesa</h2>
              <form onSubmit={crearMesa} className="space-y-4">
                <input type="text" placeholder="Número" value={nuevaMesa.numero}
                  onChange={e => setNuevaMesa({...nuevaMesa, numero: e.target.value})}
                  className="w-full border rounded p-2" required />
                <input type="number" placeholder="Capacidad" value={nuevaMesa.capacidad}
                  onChange={e => setNuevaMesa({...nuevaMesa, capacidad: +e.target.value})}
                  className="w-full border rounded p-2" required />
                <input type="text" placeholder="Zona (Interior, Terraza...)" value={nuevaMesa.zona}
                  onChange={e => setNuevaMesa({...nuevaMesa, zona: e.target.value})}
                  className="w-full border rounded p-2" />
                <button disabled={loading} className="w-full bg-emerald-500 text-white py-2 rounded hover:bg-emerald-600">
                  {loading ? 'Creando...' : 'Crear Mesa'}
                </button>
              </form>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold mb-4">Mesas ({mesas.length})</h2>
              <div className="grid grid-cols-3 gap-3">
                {mesas.map((m: any) => (
                  <div key={m.id} className={`p-4 rounded-lg text-center ${m.estado === 'DISPONIBLE' ? 'bg-green-100' : 'bg-red-100'}`}>
                    <div className="text-2xl font-bold">{m.numero}</div>
                    <div className="text-sm text-gray-600">{m.capacidad} pers.</div>
                    <div className="text-xs">{m.zona || 'Sin zona'}</div>
                  </div>
                ))}
                {mesas.length === 0 && <p className="col-span-3 text-gray-500 text-center">Sin mesas</p>}
              </div>
            </div>
          </div>
        )}

        {/* RESERVAS */}
        {vista === 'reservas' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold mb-4">Nueva Reserva</h2>
              <form onSubmit={crearReserva} className="space-y-4">
                <input type="text" placeholder="Nombre cliente" value={nuevaReserva.clienteNombre}
                  onChange={e => setNuevaReserva({...nuevaReserva, clienteNombre: e.target.value})}
                  className="w-full border rounded p-2" required />
                <input type="tel" placeholder="Teléfono" value={nuevaReserva.clienteTelefono}
                  onChange={e => setNuevaReserva({...nuevaReserva, clienteTelefono: e.target.value})}
                  className="w-full border rounded p-2" required />
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" value={nuevaReserva.fecha}
                    onChange={e => setNuevaReserva({...nuevaReserva, fecha: e.target.value})}
                    className="border rounded p-2" required />
                  <input type="time" value={nuevaReserva.hora}
                    onChange={e => setNuevaReserva({...nuevaReserva, hora: e.target.value})}
                    className="border rounded p-2" required />
                </div>
                <select value={nuevaReserva.numPersonas}
                  onChange={e => setNuevaReserva({...nuevaReserva, numPersonas: +e.target.value})}
                  className="w-full border rounded p-2">
                  {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} personas</option>)}
                </select>
                <button disabled={loading} className="w-full bg-emerald-500 text-white py-2 rounded hover:bg-emerald-600">
                  {loading ? 'Creando...' : 'Crear Reserva'}
                </button>
              </form>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Reservas</h2>
                <input type="date" value={fechaSel} onChange={e => setFechaSel(e.target.value)}
                  className="border rounded p-1 text-sm" />
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {reservas.map((r: any) => (
                  <div key={r.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">{r.clienteNombre}</div>
                        <div className="text-sm text-gray-600">{r.hora} - {r.numPersonas} pers.</div>
                        <div className="text-sm text-gray-500">{r.clienteTelefono}</div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        r.estado === 'CONFIRMADA' ? 'bg-green-100 text-green-800' :
                        r.estado === 'CANCELADA' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>{r.estado}</span>
                    </div>
                    {r.estado === 'PENDIENTE' && (
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => confirmarReserva(r.id)} className="text-xs bg-green-500 text-white px-2 py-1 rounded">Confirmar</button>
                        <button onClick={() => cancelarReserva(r.id)} className="text-xs bg-red-500 text-white px-2 py-1 rounded">Cancelar</button>
                      </div>
                    )}
                  </div>
                ))}
                {reservas.length === 0 && <p className="text-gray-500 text-center">Sin reservas para esta fecha</p>}
              </div>
            </div>
          </div>
        )}

        {/* LISTA ESPERA */}
        {vista === 'espera' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold mb-4">Agregar a Lista</h2>
              <form onSubmit={agregarEspera} className="space-y-4">
                <input type="text" placeholder="Nombre" value={nuevoEspera.clienteNombre}
                  onChange={e => setNuevoEspera({...nuevoEspera, clienteNombre: e.target.value})}
                  className="w-full border rounded p-2" required />
                <input type="tel" placeholder="Teléfono" value={nuevoEspera.clienteTelefono}
                  onChange={e => setNuevoEspera({...nuevoEspera, clienteTelefono: e.target.value})}
                  className="w-full border rounded p-2" required />
                <select value={nuevoEspera.numPersonas}
                  onChange={e => setNuevoEspera({...nuevoEspera, numPersonas: +e.target.value})}
                  className="w-full border rounded p-2">
                  {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} personas</option>)}
                </select>
                <button disabled={loading} className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600">
                  {loading ? 'Agregando...' : 'Agregar a Lista'}
                </button>
              </form>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold mb-4">Lista de Espera ({listaEspera.length})</h2>
              <div className="space-y-3">
                {listaEspera.map((item: any, idx: number) => (
                  <div key={item.id} className="border rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center font-bold text-orange-600">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{item.clienteNombre}</div>
                        <div className="text-sm text-gray-600">{item.numPersonas} pers. - ~{item.tiempoEsperaEstimado} min</div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        item.estado === 'NOTIFICADO' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>{item.estado}</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => notificarEspera(item.id)} className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Notificar</button>
                      <button onClick={() => sentarEspera(item.id)} className="text-xs bg-green-500 text-white px-2 py-1 rounded">Sentar</button>
                      <button onClick={() => cancelarEspera(item.id)} className="text-xs bg-red-500 text-white px-2 py-1 rounded">Cancelar</button>
                    </div>
                  </div>
                ))}
                {listaEspera.length === 0 && <p className="text-gray-500 text-center">Lista vacía</p>}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
