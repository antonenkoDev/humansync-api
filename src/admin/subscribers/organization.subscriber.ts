import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  Repository,
  UpdateEvent,
} from 'typeorm';
import { Organization } from '../entities/organization.admin.entity';
import { ORGANIZATION_REPOSITORY } from '../providers/organization.providers';
import { Inject, Logger } from '@nestjs/common';
import { ADMIN_DATA_SOURCE } from '../providers/database.providers';
import { ConnectionPoolService } from '../../db/connection-pool/connection-pool.service';

@EventSubscriber()
export class OrganizationSubscriber
  implements EntitySubscriberInterface<Organization>
{
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @Inject(ORGANIZATION_REPOSITORY)
    private organizationRepository: Repository<Organization>,
    @Inject(ADMIN_DATA_SOURCE)
    private dataSource: DataSource,
    private connectionPoolService: ConnectionPoolService,
  ) {
    this.dataSource.subscribers.push(this);
    this.logger.log('Subscriber con');
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  listenTo(): Function | string {
    return Organization;
  }

  beforeInsert(event: InsertEvent<Organization>): Promise<any> | void {}

  async afterInsert(event: InsertEvent<Organization>): Promise<any> {}

  afterUpdate(event: UpdateEvent<Organization>): Promise<any> | void {}
}
