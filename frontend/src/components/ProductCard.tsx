import { Link } from 'react-router-dom';

interface ProductProps {
  id: string;
  name: string;
  category: string;
  imageUrl?: string | null;
}

export const ProductCard = ({ id, name, category, imageUrl }: ProductProps) => {
  return (
    <div className="bg-surface rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-text-secondary">
      <div className="h-40 bg-surface rounded-t overflow-hidden mb-4">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="h-full flex items-center justify-center text-text-secondary">Sem Imagem</div>
        )}
      </div>
      <div className="px-4 pb-4">
        <h3 className="font-bold text-lg truncate text-text-primary">{name}</h3>
        <p className="text-sm text-text-secondary mb-4 uppercase tracking-wider font-semibold">{category}</p>
        <Link
          to={`/product/${id}`}
          className="block text-center bg-primary-strong text-white py-2 rounded hover:bg-primary-dark transition-colors"
        >
          Ver detalhes
        </Link>
      </div>
    </div>
  );
};