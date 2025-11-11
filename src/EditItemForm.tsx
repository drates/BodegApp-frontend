import { useState } from 'react';
import { authFetch } from './utils/authFetch'; // ajusta la ruta si es necesario


type Item = {
  id: number;
  name: string;
  boxes: number;
  unitsPerBox: number;
};

type EditItemFormProps = {
  item: Item;
  onCancel: () => void;
  onItemUpdated: () => void;
};

function EditItemForm({ item, onCancel, onItemUpdated }: EditItemFormProps) {
  const [name, setName] = useState(item.name);
  const [boxes, setBoxes] = useState(item.boxes);
  const [unitsPerBox, setUnitsPerBox] = useState(item.unitsPerBox);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedItem = { ...item, name, boxes, unitsPerBox };

    try {
      const res = await authFetch("http://localhost:5000/items", {
  method: "POST",
  body: JSON.stringify(updatedItem),
});

      if (res.ok) {
        onItemUpdated();
      } else {
        console.error("Error al actualizar item");
      }
    } catch (err) {
      console.error("Error de red:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
      <h3>Editar item</h3>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <input
        type="number"
        value={boxes}
        onChange={e => setBoxes(Number(e.target.value))}
        required
      />
      <input
        type="number"
        value={unitsPerBox}
        onChange={e => setUnitsPerBox(Number(e.target.value))}
        required
      />
      <button type="submit">Guardar</button>
      <button type="button" onClick={onCancel}>Cancelar</button>
    </form>
  );
}

export default EditItemForm;
