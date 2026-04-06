"use client";

import { useEffect, useState } from "react";
import { getServices, createService, deleteService } from "./actions";
import { CreateServiceInput } from "@/lib/validators/service";

export default function ServiciosAdminPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<CreateServiceInput>({
    name: "",
    description: "",
    type: "manejo_redes",
    price: 0,
    duration_months: 1,
    is_active: true
  });
  const [formError, setFormError] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    const { data, error } = await getServices();
    if (error) {
      setErrorLocal(error);
    } else {
      setServices(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    
    let parsedValue = value;
    if (type === "number") {
      parsedValue = value === "" ? "" : Number(value);
    } else if (type === "checkbox") {
      parsedValue = (e.target as HTMLInputElement).checked;
    }

    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    const { success, error, details } = await createService(formData);
    
    if (success) {
      alert("Servicio creado exitosamente!");
      setFormData({
        name: "",
        description: "",
        type: "manejo_redes",
        price: 0,
        duration_months: 1,
        is_active: true
      });
      fetchServices();
    } else {
      setFormError(details || error || "Error desconocido");
    }
    
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este servicio?")) return;
    
    const { success, error } = await deleteService(id);
    if (success) {
      fetchServices();
    } else {
      alert("Error al eliminar: " + error);
    }
  };

  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row gap-6">
      
      {/* Formulario de Creación */}
      <div className="w-full md:w-1/3 bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-fit">
        <h2 className="text-xl font-bold mb-4">Crear Nuevo Servicio</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input 
              type="text" name="name" 
              value={formData.name} onChange={handleInputChange} 
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required 
            />
            {formError?.fieldErrors?.name && <p className="text-red-500 text-xs mt-1">{formError.fieldErrors.name[0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea 
              name="description" 
              value={formData.description || ""} onChange={handleInputChange} 
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo</label>
            <select 
              name="type" 
              value={formData.type} onChange={handleInputChange} 
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
            >
              <option value="manejo_redes">Manejo de Redes</option>
              <option value="auditoria">Auditoría</option>
              <option value="capacitacion">Capacitación</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Precio ($)</label>
              <input 
                type="number" name="price" step="0.01" min="0"
                value={formData.price} onChange={handleInputChange} 
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Meses Duración</label>
              <input 
                type="number" name="duration_months" min="1"
                value={formData.duration_months} onChange={handleInputChange} 
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required 
              />
            </div>
          </div>

          <div className="flex items-center">
            <input 
              type="checkbox" name="is_active" id="is_active"
              checked={formData.is_active} onChange={handleInputChange} 
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">Activo / Visible</label>
          </div>

          {typeof formError === 'string' && <p className="text-red-500 text-sm mt-2">{formError}</p>}

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            {isSubmitting ? "Guardando..." : "Guardar Servicio"}
          </button>
        </form>
      </div>

      {/* Lista de Servicios */}
      <div className="w-full md:w-2/3">
        <h1 className="text-2xl font-bold mb-6">Catálogo de Servicios</h1>
        
        {loading ? (
           <div className="text-center p-8">Cargando servicios...</div>
        ) : errorLocal ? (
           <div className="text-center p-8 text-red-500">Error: {errorLocal}</div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo / Precio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {services.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No hay servicios registrados</td>
                  </tr>
                ) : (
                  services.map((service) => (
                    <tr key={service.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{service.name}</div>
                        <div className="text-xs text-gray-500 max-w-xs truncate">{service.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">{service.type.replace('_', ' ')}</div>
                        <div className="text-sm font-bold text-gray-900">${service.price} / {service.duration_months}m</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${service.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {service.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleDelete(service.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                        {/* UPDATE is omitted here for brevity, but you can see the table updates immediately */}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
