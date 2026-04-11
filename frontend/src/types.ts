export interface Product {
  id_produto: string;
  nome_produto: string;
  categoria_produto?: string | null;
  peso_produto_gramas?: number | null;
  comprimento_centimetros?: number | null;
  altura_centimetros?: number | null;
  largura_centimetros?: number | null;
  image_url?: string | null;
}

export interface ProductCreate extends Product {
  nova_categoria?: string | null;
  categoria_imagem_url?: string | null;
}

export interface ProductUpdate {
  nome_produto?: string | null;
  categoria_produto?: string | null;
  peso_produto_gramas?: number | null;
  comprimento_centimetros?: number | null;
  altura_centimetros?: number | null;
  largura_centimetros?: number | null;
}

export interface ProductMetrics {
  total_sales: number;
  average_rating: number;
}

export interface ProductComment {
  id_avaliacao: string;
  avaliacao: number;
  titulo_comentario?: string | null;
  comentario: string;
  data_comentario?: string | null;
}

export interface ProductDetails {
  info: Product;
  metrics: ProductMetrics;
  comentarios: ProductComment[];
  total_comments?: number;
}
