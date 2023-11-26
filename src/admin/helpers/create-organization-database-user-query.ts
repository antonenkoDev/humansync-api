export function CreateOrganizationDatabaseUserQuery(databaseName: string) {
  return `DO
        $do$
        BEGIN
          IF EXISTS (
              SELECT FROM pg_catalog.pg_roles
              WHERE  rolname = '${databaseName}') THEN

              RAISE NOTICE 'Role "${databaseName}" already exists. Skipping.';
          ELSE
              CREATE ROLE "${databaseName}" LOGIN;
          END IF;
        END
        $do$;`;
}
