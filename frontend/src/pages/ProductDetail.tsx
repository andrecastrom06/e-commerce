import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ProductDetails } from '../types';

export const ProductDetail = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await axios.get<ProductDetails>(`http://localhost:8000/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        setError('Não foi possível carregar os detalhes do produto.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm('Confirma exclusão deste produto?')) return;

    try {
      await axios.delete(`http://localhost:8000/products/${id}`);
      navigate('/');
    } catch (err) {
      setError('Falha ao excluir o produto.');
    }
  };

  if (!id) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-red-600">ID do produto inválido.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-gray-700">Carregando detalhes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-red-600 mb-4">{error}</p>
        <Link to="/" className="text-blue-600 hover:underline">
          Voltar ao catálogo
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-red-600">Produto não encontrado.</p>
      </div>
    );
  }

  const { info, metrics } = product;

  return (
    <div className="container mx-auto p-6">
      {info.image_url && (
        <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
          <img src={info.image_url} alt={info.nome_produto} className="w-full h-64 object-cover" />
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{info.nome_produto}</h1>
          <p className="text-sm text-gray-500">Categoria: {info.categoria_produto || 'Sem categoria'}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/product/new"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Novo produto
          </Link>
          <Link
            to={`/product/${id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Editar produto
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Excluir produto
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Detalhes do Produto</h2>
          <div className="space-y-3 text-gray-700">
            <p>
              <span className="font-semibold">Peso:</span> {info.peso_produto_gramas ?? '-'} g
            </p>
            <p>
              <span className="font-semibold">Comprimento:</span> {info.comprimento_centimetros ?? '-'} cm
            </p>
            <p>
              <span className="font-semibold">Altura:</span> {info.altura_centimetros ?? '-'} cm
            </p>
            <p>
              <span className="font-semibold">Largura:</span> {info.largura_centimetros ?? '-'} cm
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Métricas</h2>
          <div className="space-y-3 text-gray-700">
            <p>
              <span className="font-semibold">Total de vendas:</span> {metrics.total_sales}
            </p>
            <p>
              <span className="font-semibold">Média de avaliações:</span> {metrics.average_rating.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
