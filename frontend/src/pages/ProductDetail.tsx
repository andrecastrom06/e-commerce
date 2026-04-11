import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ProductDetails } from '../types';

export const ProductDetail = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchProduct = async (loadAllComments = false) => {
    setLoadingComments(loadAllComments);
    setError('');

    try {
      const suffix = loadAllComments ? '?load_all_comments=true' : '';
      const response = await axios.get<ProductDetails>(`http://localhost:8000/products/${id}${suffix}`);
      setProduct(response.data);
      if (loadAllComments) {
        setShowAllComments(true);
      }
    } catch (err) {
      setError('Não foi possível carregar os detalhes do produto.');
    } finally {
      setLoading(false);
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchProduct(false);
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);

    try {
      await axios.delete(`http://localhost:8000/products/${id}`);
      navigate('/');
    } catch (err) {
      setError('Falha ao excluir o produto.');
      setDeleting(false);
      setShowDeleteConfirm(false);
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
            to="/"
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors"
          >
            ← Voltar ao catálogo
          </Link>
          <Link
            to={`/product/${id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Editar produto
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
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

      {product.comentarios && product.comentarios.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Comentários dos Clientes</h2>
          <p className="text-sm text-gray-500 mb-4">
            Mostrando {product.comentarios.length} de {product.total_comments ?? product.comentarios.length} comentários.
          </p>
          <div className="space-y-4">
            {product.comentarios.map((comentario) => (
              <div key={comentario.id_avaliacao} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < comentario.avaliacao ? "text-yellow-400" : "text-gray-300"}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {comentario.data_comentario ? new Date(comentario.data_comentario).toLocaleDateString('pt-BR') : ''}
                    </span>
                  </div>
                </div>
                {comentario.titulo_comentario && comentario.titulo_comentario !== "Sem título" && (
                  <h3 className="font-semibold text-gray-800 mb-1">{comentario.titulo_comentario}</h3>
                )}
                <p className="text-gray-700">{comentario.comentario}</p>
              </div>
            ))}
          </div>

          {product.total_comments && product.comentarios.length < product.total_comments && (
            <button
              onClick={() => fetchProduct(true)}
              disabled={loadingComments}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loadingComments ? 'Carregando comentários...' : 'Carregar todos os comentários'}
            </button>
          )}
        </div>
      )}

      {/* Modal de Confirmação de Deleção */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Confirmar exclusão</h2>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir o produto <strong>{info.nome_produto}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deletando...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
