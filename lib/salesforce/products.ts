import { Post, Cards } from "@/lib/types";
import { executeSalesforceQuery } from "@/lib/salesforce";

interface SalesforceProduct {
  Id: string;
  Name: string;
  ProductCode: string;
  Description: string;
  IsActive: boolean;
  Family: string;
  UnitPrice?: number;
  [key: string]: any;
}

async function fetchActivePricebookId(conn: any): Promise<string | null> {
  try {
    const pricebookQuery = `
      SELECT Id, Name, IsActive, IsStandard
      FROM Pricebook2
      WHERE IsActive = true
      ORDER BY IsStandard DESC
    `;
    const pricebookResult = await conn.query(pricebookQuery);
    console.log(
      "Available pricebooks:",
      pricebookResult.records.map((pb) => ({ Id: pb.Id, Name: pb.Name }))
    );

    if (pricebookResult.records.length > 0) {
      const activePricebookId = pricebookResult.records[0].Id;
      console.log(
        `Using pricebook: ${pricebookResult.records[0].Name} (${activePricebookId})`
      );
      return activePricebookId;
    } else {
      console.log(
        "No active pricebooks found. Proceeding without pricing information."
      );
      return null;
    }
  } catch (error) {
    console.error("Error fetching pricebooks:", error);
    console.log("Proceeding without pricing information.");
    return null;
  }
}

async function fetchProducts(
  conn: any,
  params: {
    limit: number;
    productType?: string;
    productIds?: string[];
  }
): Promise<SalesforceProduct[]> {
  const { limit, productType, productIds } = params;
  const productsQuery = `
    SELECT Id, Name, ProductCode, Description, Family
    FROM Product2
    WHERE IsActive = true
    ${productType ? ` AND Family = '${productType.replace(/'/g, "\\'")}'` : ""}
    ${
      productIds && productIds.length > 0
        ? ` AND Id IN (${productIds
            .map((id) => `'${id.replace(/'/g, "\\'")}'`)
            .join(", ")})`
        : ""
    }
    LIMIT ${parseInt(limit.toString()) || 10}
  `;
  console.log("Executing products query:", productsQuery);
  const productsResult = await conn.query(productsQuery);
  return productsResult.records;
}

async function fetchProductPrices(
  conn: any,
  activePricebookId: string,
  productIds: string[]
): Promise<Record<string, number>> {
  try {
    const pricesQuery = `
      SELECT Product2Id, UnitPrice
      FROM PricebookEntry
      WHERE Pricebook2Id = '${activePricebookId}'
      AND Product2Id IN (${productIds.map((id) => `'${id}'`).join(", ")})
    `;
    console.log("Executing prices query:", pricesQuery);
    const pricesResult = await conn.query(pricesQuery);

    const priceMap: Record<string, number> = {};
    pricesResult.records.forEach((entry) => {
      priceMap[entry.Product2Id] = entry.UnitPrice;
    });

    console.log(`Found prices for ${Object.keys(priceMap).length} products`);
    return priceMap;
  } catch (error) {
    console.error("Error fetching prices:", error);
    return {};
  }
}

function mapProductsToPosts(
  products: SalesforceProduct[],
  priceMap: Record<string, number>
): Post[] {
  return products.map((product) => {
    const post: Post = {
      acf_data: {
        product_code: product.ProductCode || "",
        product_family: product.Family || "",
        price: priceMap[product.Id] || 0,
      },
      breadcrumbs: `Products/${product.Family || "All"}/${product.Name}`,
      id: parseInt(product.Id) || Math.floor(Math.random() * 10000),
      slug: {
        slug:
          product.ProductCode?.toLowerCase().replace(/\s+/g, "-") ||
          `product-${product.Id}`,
        full_path: `/products/${
          product.ProductCode?.toLowerCase().replace(/\s+/g, "-") ||
          `product-${product.Id}`
        }`,
      },
      type: {
        id: "product",
        name: "Product",
        slug: "product",
      },
      path: `/products/${
        product.ProductCode?.toLowerCase().replace(/\s+/g, "-") ||
        `product-${product.Id}`
      }`,
      status: "publish",
      date: new Date(),
      title: product.Name,
      excerpt: product.Description || "",
      featured_image: {
        sizes: {
          full: "",
          large: "",
          medium: "",
          thumbnail: "",
        },
        url: "",
      },
      image: {
        full: "",
        thumbnail: "",
      },
      categories: [
        {
          id: 1,
          name: product.Family || "Products",
          slug: (product.Family || "products")
            .toLowerCase()
            .replace(/\s+/g, "-"),
        },
      ],
      category_names: [product.Family || "Products"],
      terms: {
        product_type: [product.Family || ""],
      },
      template: {
        beforeContent: [],
        afterContent: [],
        title: "Product Template",
        slug: "product-template",
      },
      tags: [],
      related_posts: [],
      password: "",
      card: "ProductCard" as Cards,
    };

    return post;
  });
}

export async function getSalesforceProducts(params: {
  limit?: number;
  productType?: string;
  category?: string;
  featured?: boolean;
  productIds?: string[];
}): Promise<Post[]> {
  try {
    const { limit = 10, productType, productIds } = params;

    return await executeSalesforceQuery(async (conn) => {
      const activePricebookId = await fetchActivePricebookId(conn);
      const products = await fetchProducts(conn, {
        limit,
        productType,
        productIds,
      });

      if (products.length === 0) {
        console.log("No products found");
        return [];
      }

      const priceMap = activePricebookId
        ? await fetchProductPrices(
            conn,
            activePricebookId,
            products.map((p) => p.Id)
          )
        : {};

      return mapProductsToPosts(products, priceMap);
    });
  } catch (error) {
    console.error("Error fetching Salesforce products:", error);
    return [];
  }
}
