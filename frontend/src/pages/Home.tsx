import { useEffect, useState } from 'react';
import axios from 'axios';
import { ProductCard } from '../components/ProductCard';

export const Home = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const limit = 12;

  const fetchProducts = async () => {
    const response = await axios.get(`http://localhost:8000/products?search=${search}&skip=${page * limit}&limit=${limit}`);
    setProducts(response.data.products);
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  return (
    <div className="container mx-auto p-6">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Catálogo de Produtos</h1>
        <input 
          type="text" 
          placeholder="Buscar produto..." 
          className="border p-2 rounded w-full md:w-96 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          onChange={(e) => setSearch(e.target.value)}
        />
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((p: any) => (
          <ProductCard key={p.id_produto} id={p.id_produto} name={p.nome_produto} category={p.categoria_produto} />
        ))}
      </div>

      <div className="flex justify-center mt-10 gap-4">
        <button 
          disabled={page === 0}
          onClick={() => setPage(p => p - 1)}
          className="px-6 py-2 bg-gray-800 text-white rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <button 
          onClick={() => setPage(p => p + 1)}
          className="px-6 py-2 bg-gray-800 text-white rounded"
        >
          Próxima
        </button>
      </div>
    </div>
  );
};
