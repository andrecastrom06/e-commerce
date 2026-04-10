import { Link } from 'react-router-dom';

interface ProductProps {
  id: string;
  name: string;
  category: string;
}

export const ProductCard = ({ id, name, category }: ProductProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-xl transition-shadow border border-gray-100">
      <div className="h-40 bg-gray-200 rounded mb-4 flex items-center justify-center">
        <span className="text-gray-400">Sem Imagem</span>
      </div>
      <h3 className="font-bold text-lg truncate text-gray-800">{name}</h3>
      <p className="text-sm text-blue-600 mb-4 uppercase tracking-wider font-semibold">{category}</p>
      <Link 
        to={`/product/${id}`} 
        className="block text-center bg-visagio-blue text-white py-2 rounded hover:bg-blue-800 transition-colors"
      >
        Ver Detalhes
      </Link>
    </div>
  );
};