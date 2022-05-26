import { UseGuards } from '@nestjs/common';
import { Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { AuthorizationGuard } from 'src/http/auth/authorization.guard';
import { ProductService } from 'src/services/product.service';
import { PurchasesService } from 'src/services/purchases.service';
import { Purchase } from '../models/purchases';

@Resolver(() => Purchase)
export class PurchaseResolver {
  constructor(
    private purchasesService: PurchasesService,
    private productService: ProductService,
  ) {}
  @Query(() => [Purchase])
  @UseGuards(AuthorizationGuard)
  async purchases() {
    return this.purchasesService.listAllPurchases();
  }

  @ResolveField()
  product(@Parent() purchase: Purchase) {
    return this.productService.getProductById(purchase.productId);
  }
}
