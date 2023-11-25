import { MigrationInterface, QueryRunner } from 'typeorm';

export class Organization1700235236568 implements MigrationInterface {
  name = 'Organization1700235236568';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "organization" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "customer_id" character varying NOT NULL, "name" character varying NOT NULL, "database_name" character varying NOT NULL, "auth0_organization_id" character varying NOT NULL, "auth0_connection_id" character varying NOT NULL, CONSTRAINT "UQ_401a0707e77c808ea0c641bc9a8" UNIQUE ("customer_id"), CONSTRAINT "UQ_c21e615583a3ebbb0977452afb0" UNIQUE ("name"), CONSTRAINT "UQ_59c3327f3fc33d35bda5e8f5e92" UNIQUE ("database_name"), CONSTRAINT "UQ_3ca2d5fa87ad19226a04f33f9c0" UNIQUE ("auth0_organization_id"), CONSTRAINT "UQ_4096cb5091b0c5b592e8fea07c9" UNIQUE ("auth0_connection_id"), CONSTRAINT "PK_59f940b5775a9ccf5c2f094c8af" PRIMARY KEY ("uuid"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "organization"`);
  }
}
