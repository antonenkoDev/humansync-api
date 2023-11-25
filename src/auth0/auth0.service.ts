import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AuthenticationClient,
  ConnectionCreate,
  ManagementClient,
  PostOrganizationsRequest,
  UserCreate,
} from 'auth0';

@Injectable()
export class Auth0Service {
  private authClient: AuthenticationClient;
  private managementClient: ManagementClient;

  constructor(private configService: ConfigService) {
    // Initialize the AuthenticationClient
    this.authClient = new AuthenticationClient({
      domain: this.configService.get<string>('AUTH0_DOMAIN'),
      clientId: this.configService.get<string>('AUTH0_CLIENT_ID'),
      clientSecret: this.configService.get<string>('AUTH0_CLIENT_SECRET'),
    });

    // Initialize the ManagementClient
    this.managementClient = new ManagementClient({
      domain: this.configService.get<string>('AUTH0_DOMAIN'),
      clientId: this.configService.get<string>('AUTH0_CLIENT_ID'),
      clientSecret: this.configService.get<string>('AUTH0_CLIENT_SECRET'),
    });
  }

  async createOrganization(data: PostOrganizationsRequest) {
    const createOrganizationResponse =
      await this.managementClient.organizations.create(data);
    if (!createOrganizationResponse?.data?.id) {
      throw new InternalServerErrorException(
        'Auth0: Connection Database was not created',
      );
    }
    return createOrganizationResponse.data.id;
  }

  async createDatabaseConnection(data: ConnectionCreate) {
    const createConnectionResponse =
      await this.managementClient.connections.create(data);
    if (!createConnectionResponse?.data?.id) {
      throw new InternalServerErrorException(
        'Auth0: Connection Database was not created',
      );
    }
    return createConnectionResponse.data.id;
  }

  async createOrGetUser(data: UserCreate) {
    const getUserResponse = await this.managementClient.usersByEmail.getByEmail(
      {
        email: data.email,
      },
    );
    if (getUserResponse.data?.length > 0) {
      return getUserResponse.data[0].user_id;
    }

    const createUserResponse = await this.managementClient.users.create(data);
    if (!createUserResponse?.data?.user_id) {
      throw new InternalServerErrorException('Auth0: User was not created');
    }
    return createUserResponse.data.user_id;
  }

  async addUserToOrganization(userId: string, organizationId: string) {
    const response = await this.managementClient.organizations.addMembers(
      { id: organizationId },
      {
        members: [userId],
      },
    );
    if (response.status !== 204) {
      throw new InternalServerErrorException(
        'Auth0: User was not added to Organization',
      );
    }
    return true;
  }
}
