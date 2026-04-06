"use client";

import { useEffect, useState } from "react";
import { getReservations, updateReservationStatus, type ReservationStatus } from "./actions";

export default function ReservasAdminPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = async () => {
    setLoading(true);
    const { data, error } = await getReservations();
    if (error) {
      setError(error);
    } else {
      setReservations(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleStatusUpdate = async (id: string, status: ReservationStatus) => {
    const { success, error } = await updateReservationStatus(id, status);
    if (success) {
      // Recargar datos para ver el cambio reflejado
      fetchReservations();
    } else {
      alert("Error al actualizar: " + error);
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando reservas...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Gestión de Reservas</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha / Hora</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reservations.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No hay reservas registradas</td>
              </tr>
            ) : (
              reservations.map((res) => (
                <tr key={res.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{res.id.substring(0, 8)}...</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="font-medium">{res.full_name}</div>
                    <div className="text-xs text-gray-500">{res.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(res.preferred_date).toLocaleString('es-EC', { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${res.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        res.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                      }`}>
                      {res.status === 'confirmed' ? 'Confirmada' :
                        res.status === 'pending' ? 'Pendiente' :
                          res.status === 'cancelled' ? 'Cancelada' : res.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleStatusUpdate(res.id, 'confirmed')}
                      className="text-green-600 hover:text-green-900 mr-3 disabled:opacity-50"
                      disabled={res.status === 'confirmed'}
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(res.id, 'cancelled')}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      disabled={res.status === 'cancelled'}
                    >
                      Cancelar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

