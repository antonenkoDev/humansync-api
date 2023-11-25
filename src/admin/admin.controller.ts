import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';
import { AdminService } from './admin.service';

import { Organization } from './entities/organization.admin.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('admin')
export class AdminController {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private adminService: AdminService) {
    this.logger.log('ADMIN MODULE initialized');
  }

  @Get('organizations/:customerId')
  @ApiOkResponse({
    description: 'Get an Organization',
  })
  async getOrganization(@Param('customerId') customerId: string) {
    return await this.adminService.getOrganization(customerId);
  }

  @Get('organizations')
  @ApiOkResponse({
    description: 'Get a list of organizations',
    type: Organization,
    isArray: true,
  })
  async getOrganizationList() {
    return await this.adminService.getOrganizations();
  }

  @Post('organizations')
  @ApiOkResponse({
    description: 'Organization successfully added',
    type: Organization,
  })
  async registerOrganization(
    @Body() createOgranizationDto: CreateOrganizationDto,
  ) {
    return await this.adminService.createOrganization(createOgranizationDto);
  }
}
