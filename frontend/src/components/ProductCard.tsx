import { Link } from 'react-router-dom';

interface ProductProps {
  id: string;
  name: string;
  category: string;
  imageUrl?: string | null;
}

export const ProductCard = ({ id, name, category, imageUrl }: ProductProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-gray-100">
      <div className="h-40 bg-gray-200 rounded-t overflow-hidden mb-4">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">Sem Imagem</div>
        )}
      </div>
      <div className="px-4 pb-4">
        <h3 className="font-bold text-lg truncate text-gray-800">{name}</h3>
        <p className="text-sm text-gray-500 mb-4 uppercase tracking-wider font-semibold">{category}</p>
        <Link
          to={`/product/${id}`}
          className="block text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Ver detalhes
        </Link>
      </div>
    </div>
  );
};