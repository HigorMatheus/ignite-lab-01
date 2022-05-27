import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { AuthorizationGuard } from 'src/http/auth/authorization.guard';
import { AuthUser, CurrentUser } from 'src/http/auth/current-user';
import { CustomersService } from 'src/services/customers.service';
import { ProductsService } from 'src/services/products.service';
import { PurchasesService } from 'src/services/purchases.service';
import { CreatePurchaseInput } from '../inputs/create-purchase-input';
import { Purchase } from '../models/purchases';

@Resolver(() => Purchase)
export class PurchaseResolver {
  constructor(
    private purchasesService: PurchasesService,
    private productService: ProductsService,
    private customersService: CustomersService,
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

  @Mutation()
  @UseGuards(AuthorizationGuard)
  async createPurchase(
    @Args('data') { productId }: CreatePurchaseInput,
    @CurrentUser() user: AuthUser,
  ) {
    const authUserId = user.sub;
    let customer = await this.customersService.getCustomerAuthUserId(
      authUserId,
    );
    if (!customer) {
      customer = await this.customersService.createCustomer({ authUserId });
    }
    return this.purchasesService.createPurchase({
      customerId: customer.id,
      productId,
    });
  }
}
