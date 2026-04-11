import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';

interface ProductsResponse {
  total: number;
  products: Product[];
}

export const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const limit = 12;

  const fetchProducts = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get<ProductsResponse>(
        `http://localhost:8000/products?search=${encodeURIComponent(search)}&skip=${page * limit}&limit=${limit}`
      );
      setProducts(response.data.products);
      setTotal(response.data.total);
    } catch (err) {
      setError('Não foi possível carregar o catálogo de produtos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  return (
    <div className="container mx-auto p-6">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Catálogo de Produtos</h1>
          <p className="text-gray-500">Pesquisa de produtos, navegação e visão geral de estoque.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link
            to="/product/new"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-center"
          >
            Novo produto
          </Link>
          <input
            type="text"
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => {
              setPage(0);
              setSearch(e.target.value);
            }}
            className="border p-2 rounded w-full sm:w-96 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </header>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {loading ? (
        <p className="text-gray-700">Carregando produtos...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard
            key={p.id_produto}
            id={p.id_produto}
            name={p.nome_produto}
            category={p.categoria_produto || 'Sem categoria'}
            imageUrl={p.image_url}
          />
            ))}
          </div>

          {products.length === 0 && (
            <p className="text-gray-700 mt-6">Nenhum produto encontrado para a busca atual.</p>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-center mt-10 gap-4">
            <p className="text-gray-600">Página {page + 1} de {Math.max(1, Math.ceil(total / limit))}</p>
            <div className="flex gap-4">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-6 py-2 bg-gray-800 text-white rounded disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                disabled={(page + 1) * limit >= total}
                onClick={() => setPage((p) => p + 1)}
                className="px-6 py-2 bg-gray-800 text-white rounded disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
