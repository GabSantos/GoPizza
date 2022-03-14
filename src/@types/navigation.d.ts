export type ProductNavigationProps = {
  id?: string;
}

export type OrderNavigationProps = {
  iD: string;
}

export declare global {
  namespace ReactNavigation {
    interface RootParamList {
      home: undefined;
      product: ProductNavigationProps;
      order: OrderNavigationProps;
      orders: undefined
    }
  }
}