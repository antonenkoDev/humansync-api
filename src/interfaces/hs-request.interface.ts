import { Organization } from '../admin/entities/organization.admin.entity';

export interface HsRequest extends Request {
  organization: Organization;

  customerId: string;
}
