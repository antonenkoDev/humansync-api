import { HttpException } from '@nestjs/common';
import { RequestOptions } from '@okta/okta-auth-js';
import { Client } from '@okta/okta-sdk-nodejs';

export async function oktaGetGroup(name: string, oktaClient: Client) {
  try {
    //return await oktaClient.(name);

    const url = `${oktaClient.baseUrl}/api/v1/groups?q=${name}`;
    const request: RequestOptions = {
      method: 'get',
    };
    const response = await oktaClient.http.http(url, request);
    const group = await response.json();
    return group[0];
  } catch (err) {
    if (err instanceof HttpException && err.getStatus() == 404) {
      return null;
    }
    throw err;
  }
}
