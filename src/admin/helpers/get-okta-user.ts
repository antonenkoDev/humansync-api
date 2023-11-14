import { HttpException } from '@nestjs/common';
import { RequestOptions } from '@okta/okta-auth-js';
import { Client } from '@okta/okta-sdk-nodejs';

export async function oktaGetUser(email: string, oktaClient: Client) {
  try {
    //return await oktaClient.(name);

    const url = `${oktaClient.baseUrl}/api/v1/users?q=${email}`;
    const request: RequestOptions = {
      method: 'get',
    };
    const response = await oktaClient.http.http(url, request);
    const user = await response.json();
    return user[0];
  } catch (err) {
    if (err instanceof HttpException && err.getStatus() == 404) {
      return null;
    }
    throw err;
  }
}
