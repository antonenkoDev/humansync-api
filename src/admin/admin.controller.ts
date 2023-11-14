import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { RegisterOrganizationDto } from './dto/register-organization.dto';
import { AdminService } from './admin.service';
import { SalesforceDeviceRequestDto } from './dto/salesforce-device-request.dto';
import { ApiBadRequestResponse, ApiOkResponse } from '@nestjs/swagger';
import { SalesForceReturnObj } from './interfaces/sf-return-obj';

import { Organization } from './entities/organization.admin.entity';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Roles('SUPPORT')
  @UseGuards(OktaGuard)
  @Get('organizations')
  @ApiOkResponse({
    description: 'Get a list of organizations',
    type: OrganizationDto,
    isArray: true,
  })
  async getOrganizationList() {
    return await this.adminService.getOrganizationList();
  }

  @Post('organizations/register')
  @ApiOkResponse({
    description: 'Organization successfully added',
    type: Organization,
  })
  async registerOrganization(@Body() registerOrgDto: RegisterOrganizationDto) {
    return await this.adminService.createOrganization(registerOrgDto);
  }

  @Post('salesforce/register')
  @ApiOkResponse({ description: 'Success', type: SalesForceReturnObj })
  @ApiBadRequestResponse(badResponse)
  async salesforceDeviceRegister(
    @Body() salesforceRequest: SalesforceDeviceRequestDto,
  ) {
    return await this.adminService.handleSalesforceRequest(salesforceRequest);
  }

  @Put('salesforce/register')
  @ApiOkResponse({ description: 'Success', type: SalesForceReturnObj })
  @ApiBadRequestResponse(badResponse)
  async salesforceDeviceUpdate(
    @Body() salesforceRequest: SalesforceDeviceRequestDto,
  ) {
    return await this.adminService.handleSalesforceRequestUpdate(
      salesforceRequest,
    );
  }

  @Roles('ADMIN')
  @UseGuards(OktaGuard)
  @Delete('organization/:id')
  @ApiOkResponse({ description: 'Success' })
  @ApiBadRequestResponse(badResponse)
  async deleteOrganization(@Param('id') id: string) {
    return this.adminService.deleteTenant(id);
  }
}
