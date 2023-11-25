// tenant-identification.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { HsRequest } from '../interfaces/hs-request.interface';

@Injectable()
export class TenantIdentificationMiddleware implements NestMiddleware {
  // constructor(private adminService: AdminService) {}

  async use(req: HsRequest, res: Response, next: NextFunction) {
    const customerId = req.headers['x-customer-id'] as string;
    if (!customerId) {
      return res.status(400).send('Customer ID header is missing');
    }
    req.customerId = customerId;
    next();
    // try {
    //   const organization = await this.adminService.getOrganization(customerId);
    //   if (!organization) {
    //     return res.status(404).send('Organization not found');
    //   }
    //
    //   // Добавьте информацию об организации в запрос для последующего использования
    //   (req as HsRequest).organization = organization;
    //
    //   next();
    // } catch (error) {
    //   // Обработка ошибки, если что-то пойдет не так при получении организации
    //   throw new UnauthorizedException(error);
    // }
  }
}
