import { ProductModel, type ProductDocument } from "../models/Product";

export interface ListQuery {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ListResult {
  items: ProductDocument[];
  total: number;
  page: number;
  limit: number;
}

export async function listProducts(query: ListQuery): Promise<ListResult> {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 20));
  const filter: Record<string, unknown> = {};
  if (query.category) filter.category = query.category;
  if (query.search) {
    const term = query.search.trim();
    if (term) {
      const regex = new RegExp(term, "i");
      filter.$or = [
        { title: regex },
        { description: regex },
        { category: regex },
      ];
    }
  }

  const [items, total] = await Promise.all([
    ProductModel.find(filter)
      .sort({ title: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    ProductModel.countDocuments(filter),
  ]);

  return { items, total, page, limit };
}

export async function getProductById(id: string): Promise<ProductDocument | null> {
  if (!/^[0-9a-fA-F]{24}$/.test(id)) return null;
  return ProductModel.findById(id).lean();
}

export async function listCategories(): Promise<string[]> {
  return ProductModel.distinct("category");
}
