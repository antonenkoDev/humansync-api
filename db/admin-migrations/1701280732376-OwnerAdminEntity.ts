import { MigrationInterface, QueryRunner } from 'typeorm';

export class OwnerAdminEntity1701280732376 implements MigrationInterface {
  name = 'OwnerAdminEntity1701280732376';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "owner" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "auth0_id" character varying NOT NULL, "email" character varying NOT NULL, "first_name" character varying, "last_name" character varying, "timezone" character varying, "phone" character varying, CONSTRAINT "PK_8e76bd0b58d27ca12e333a80983" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "organization_owner_owner" ("organization_uuid" uuid NOT NULL, "owner_uuid" uuid NOT NULL, CONSTRAINT "PK_17abaf2fabc6ebdda33205bcce9" PRIMARY KEY ("organization_uuid", "owner_uuid"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b2477d94dba53ce3d63e6a7a27" ON "organization_owner_owner" ("organization_uuid") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_14d0cea1615fc46de2f374554c" ON "organization_owner_owner" ("owner_uuid") `,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_owner_owner" ADD CONSTRAINT "FK_b2477d94dba53ce3d63e6a7a275" FOREIGN KEY ("organization_uuid") REFERENCES "organization"("uuid") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_owner_owner" ADD CONSTRAINT "FK_14d0cea1615fc46de2f374554c6" FOREIGN KEY ("owner_uuid") REFERENCES "owner"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization_owner_owner" DROP CONSTRAINT "FK_14d0cea1615fc46de2f374554c6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organization_owner_owner" DROP CONSTRAINT "FK_b2477d94dba53ce3d63e6a7a275"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_14d0cea1615fc46de2f374554c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b2477d94dba53ce3d63e6a7a27"`,
    );
    await queryRunner.query(`DROP TABLE "organization_owner_owner"`);
    await queryRunner.query(`DROP TABLE "owner"`);
  }
}
