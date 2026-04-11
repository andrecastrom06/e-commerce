import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Product, ProductCreate, ProductUpdate } from '../types';

const emptyProduct: ProductCreate = {
  id_produto: '',
  nome_produto: '',
  categoria_produto: '',
  peso_produto_gramas: null,
  comprimento_centimetros: null,
  altura_centimetros: null,
  largura_centimetros: null,
  nova_categoria: null,
  categoria_imagem_url: null,
};

export const ProductForm = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductCreate>(emptyProduct);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEditMode = Boolean(id);

  useEffect(() => {
    // Carregar categorias existentes
    const fetchCategories = async () => {
      try {
        const response = await axios.get<{ categories: string[] }>('http://localhost:8000/categories');
        setCategories(response.data.categories);
      } catch (err) {
        console.error('Erro ao carregar categorias:', err);
      }
    };

    fetchCategories();
  }, []);

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

  const handleChange = (field: keyof ProductCreate, value: string) => {
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

    // Validações
    if (!product.id_produto.trim()) {
      setError('ID do produto é obrigatório.');
      setLoading(false);
      return;
    }

    if (!product.nome_produto.trim()) {
      setError('Nome do produto é obrigatório.');
      setLoading(false);
      return;
    }

    if (!isEditMode && product.categoria_produto === 'outra' && !product.nova_categoria?.trim()) {
      setError('Nome da nova categoria é obrigatório quando categoria é "Outra".');
      setLoading(false);
      return;
    }

    // Validações de valores positivos
    const camposPositivos = [
      { campo: product.peso_produto_gramas, nome: 'Peso' },
      { campo: product.comprimento_centimetros, nome: 'Comprimento' },
      { campo: product.altura_centimetros, nome: 'Altura' },
      { campo: product.largura_centimetros, nome: 'Largura' },
    ];

    for (const { campo, nome } of camposPositivos) {
      if (campo !== null && campo !== undefined && campo <= 0) {
        setError(`${nome} deve ser um valor positivo.`);
        setLoading(false);
        return;
      }
    }

    try {
      if (isEditMode && id) {
        // Para edição, enviar apenas campos de ProductUpdate
        const updateData: ProductUpdate = {
          nome_produto: product.nome_produto,
          categoria_produto: product.categoria_produto,
          peso_produto_gramas: product.peso_produto_gramas,
          comprimento_centimetros: product.comprimento_centimetros,
          altura_centimetros: product.altura_centimetros,
          largura_centimetros: product.largura_centimetros,
        };
        const response = await axios.put(`http://localhost:8000/products/${id}`, updateData);
        if (response.status === 200) {
          navigate(`/product/${id}`);
        }
      } else {
        const response = await axios.post('http://localhost:8000/products', product);
        if (response.status === 201) {
          navigate(`/product/${product.id_produto}`);
        }
      }
    } catch (err: any) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.response?.data) {
        // Pydantic validation error
        const errors = Array.isArray(err.response.data.detail) 
          ? err.response.data.detail.map((e: any) => e.msg).join(', ')
          : JSON.stringify(err.response.data.detail);
        setError(errors);
      } else {
        setError('Falha ao salvar o produto. Verifique os campos e tente novamente.');
      }
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
            <select
              value={product.categoria_produto ?? ''}
              onChange={(e) => handleChange('categoria_produto', e.target.value)}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-blue-500"
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
              <option value="outra">Outra</option>
            </select>
          </label>

          {product.categoria_produto === 'outra' && (
            <>
              <label className="block">
                <span className="text-gray-700">Nome da nova categoria *</span>
                <input
                  value={product.nova_categoria ?? ''}
                  onChange={(e) => handleChange('nova_categoria', e.target.value)}
                  className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-blue-500"
                  placeholder="Digite o nome da nova categoria"
                />
              </label>

              <label className="block">
                <span className="text-gray-700">URL da imagem da categoria (opcional)</span>
                <input
                  value={product.categoria_imagem_url ?? ''}
                  onChange={(e) => handleChange('categoria_imagem_url', e.target.value)}
                  type="url"
                  className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-blue-500"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </label>
            </>
          )}
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
            disabled={loading || !product.id_produto.trim() || !product.nome_produto.trim() || (!isEditMode && product.categoria_produto === 'outra' && !product.nova_categoria?.trim())}
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
