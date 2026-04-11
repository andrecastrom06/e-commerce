import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Product } from '../types';

const emptyProduct: Product = {
  id_produto: '',
  nome_produto: '',
  categoria_produto: '',
  peso_produto_gramas: null,
  comprimento_centimetros: null,
  altura_centimetros: null,
  largura_centimetros: null,
};

export const ProductForm = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product>(emptyProduct);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEditMode = Boolean(id);

  useEffect(() => {
    if (!isEditMode || !id) return;

    const fetchProduct = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await axios.get<{ info: Product }>(`http://localhost:8000/products/${id}`);
        setProduct(response.data.info);
      } catch (err) {
        setError('Não foi possível carregar os dados do produto para edição.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, isEditMode]);

  const handleChange = (field: keyof Product, value: string) => {
    setProduct((current) => ({
      ...current,
      [field]: ['peso_produto_gramas', 'comprimento_centimetros', 'altura_centimetros', 'largura_centimetros'].includes(field)
        ? value === ''
          ? null
          : Number(value)
        : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEditMode && id) {
        await axios.put(`http://localhost:8000/products/${id}`, product);
        navigate(`/product/${id}`);
      } else {
        await axios.post('http://localhost:8000/products', product);
        navigate(`/product/${product.id_produto}`);
      }
    } catch (err) {
      setError('Falha ao salvar o produto. Verifique os campos e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Editar produto' : 'Novo produto'}
          </h1>
          <p className="text-gray-500">Preencha os dados abaixo para salvar o produto.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors"
        >
          Voltar ao catálogo
        </button>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="block">
            <span className="text-gray-700">ID do produto</span>
            <input
              value={product.id_produto}
              onChange={(e) => handleChange('id_produto', e.target.value)}
              disabled={isEditMode}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-blue-500"
            />
          </label>

          <label className="block">
            <span className="text-gray-700">Nome do produto</span>
            <input
              value={product.nome_produto}
              onChange={(e) => handleChange('nome_produto', e.target.value)}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-blue-500"
            />
          </label>

          <label className="block">
            <span className="text-gray-700">Categoria</span>
            <input
              value={product.categoria_produto ?? ''}
              onChange={(e) => handleChange('categoria_produto', e.target.value)}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-blue-500"
            />
          </label>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="text-gray-700">Peso (g)</span>
            <input
              value={product.peso_produto_gramas ?? ''}
              onChange={(e) => handleChange('peso_produto_gramas', e.target.value)}
              type="number"
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-blue-500"
            />
          </label>

          <label className="block">
            <span className="text-gray-700">Comprimento (cm)</span>
            <input
              value={product.comprimento_centimetros ?? ''}
              onChange={(e) => handleChange('comprimento_centimetros', e.target.value)}
              type="number"
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-blue-500"
            />
          </label>

          <label className="block">
            <span className="text-gray-700">Altura (cm)</span>
            <input
              value={product.altura_centimetros ?? ''}
              onChange={(e) => handleChange('altura_centimetros', e.target.value)}
              type="number"
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-blue-500"
            />
          </label>

          <label className="block">
            <span className="text-gray-700">Largura (cm)</span>
            <input
              value={product.largura_centimetros ?? ''}
              onChange={(e) => handleChange('largura_centimetros', e.target.value)}
              type="number"
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-blue-500"
            />
          </label>
        </div>

        <div className="md:col-span-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={loading || !product.id_produto || !product.nome_produto}
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Salvando...' : isEditMode ? 'Salvar alterações' : 'Criar produto'}
          </button>
          <button
            type="button"
            onClick={() => navigate(isEditMode ? `/product/${id}` : '/')}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};
