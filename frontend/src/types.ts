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

export interface ProductMetrics {
  total_sales: number;
  average_rating: number;
}

export interface ProductDetails {
  info: Product;
  metrics: ProductMetrics;
}
