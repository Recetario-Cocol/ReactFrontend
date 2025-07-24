
import Producto from "../../producto/Producto";
import { Unidad } from "../../unidad/Unidad";
import Ingrediente from "../../ingrediente/Ingrediente";
const totalAsString = (total: number) => {
    if (typeof total !== "number") return "-";

    return total.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
    });
};

 export default function VisorIngredientesTable({
  ingredientes,
  rinde,
  precio,
  precio_unidad,
  productos,
  unidades
}: {
  ingredientes: Ingrediente[],
  rinde: number,
  precio: number,
  precio_unidad: number,
  productos: Producto[],
  unidades: Unidad[]
}) {
    const total = ingredientes.reduce((acc, ingrediente) => {
      const producto = productos.find((p) => p.id === ingrediente.productoId);
      const precioProducto = ((producto?.precio ?? 0) / (producto?.cantidad ?? 1)) * ingrediente.cantidad;
      return acc + precioProducto;
    }, 0);

    return (
      <table style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "4px 8px" }}>Producto</th>
            <th style={{ textAlign: "right", padding: "4px 8px" }}>Cantidad</th>
            <th style={{ textAlign: "right", padding: "4px 8px" }}>Precio</th>
          </tr>
        </thead>
        <tbody>
          {ingredientes.map((ingrediente, idx) => {
            const producto = productos.find((p) => p.id === ingrediente.productoId);
            const unidad = unidades.find((u) => u.id === producto?.unidadId);
            const precioProducto = ((producto?.precio ?? 0) / (producto?.cantidad ?? 1)) * ingrediente.cantidad;

            return (
              <tr key={idx} style={{ borderTop: "1px solid #ddd" }}>
                <td style={{
                  padding: "4px 8px",
                  maxWidth: "150px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}>{producto?.nombre || "(Sin producto)"}</td>
                <td style={{ padding: "4px 8px", textAlign: "right" }}>{ingrediente.cantidad + ' ' + unidad?.abreviacion}</td>
                <td style={{ padding: "4px 8px", textAlign: "right" }}>
                  {totalAsString(precioProducto)}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: "2px solid black" }}>
            <td colSpan={2} style={{ padding: "4px 8px", fontWeight: "bold", textAlign: "right" }}>
              Costo por Porcion:
            </td>
            <td style={{ padding: "4px 8px", textAlign: "right", fontWeight: "bold" }}>
              {totalAsString(total/rinde)}
            </td>
          </tr>  
          <tr style={{ borderTop: "2px solid black" }}>
            <td colSpan={2} style={{ padding: "4px 8px", fontWeight: "bold", textAlign: "right" }}>
              Costo Total:
            </td>
            <td style={{ padding: "4px 8px", textAlign: "right", fontWeight: "bold" }}>
              {totalAsString(total)}
            </td>
          </tr>
          <tr style={{ borderTop: "2px solid black" }}>
            <td colSpan={2} style={{ padding: "4px 8px", fontWeight: "bold", textAlign: "right" }}>
              Precio por Porcion:
            </td>
            <td style={{ padding: "4px 8px", textAlign: "right", fontWeight: "bold" }}>
              {totalAsString(precio_unidad)}
            </td>
          </tr>  
          <tr style={{ borderTop: "2px solid black" }}>
            <td colSpan={2} style={{ padding: "4px 8px", fontWeight: "bold", textAlign: "right" }}>
              Precio Total:
            </td>
            <td style={{ padding: "4px 8px", textAlign: "right", fontWeight: "bold" }}>
              {totalAsString(precio)}
            </td>
          </tr>
          <tr style={{ borderTop: "2px solid black" }}>
            <td colSpan={2} style={{ padding: "4px 8px", fontWeight: "bold", textAlign: "right" }}>
              Ganacia Total:
            </td>
            <td style={{ padding: "4px 8px", textAlign: "right", fontWeight: "bold" }}>
                ({ ((precio - total) / total * 100).toFixed(2) }%) { totalAsString(precio - total)}
            </td>
          </tr>
          <tr style={{ borderTop: "2px solid black" }}>
            <td colSpan={2} style={{ padding: "4px 8px", fontWeight: "bold", textAlign: "right" }}>
              Ganacia por Porcion
            </td>
            <td style={{ padding: "4px 8px", textAlign: "right", fontWeight: "bold" }}>
              ({ (((precio_unidad - (total / rinde)) / (total / rinde)) * 100).toFixed(2) }%)
              { totalAsString(precio_unidad - (total / rinde)) }
            </td>
          </tr>  
        </tfoot>
      </table>
    );
  }