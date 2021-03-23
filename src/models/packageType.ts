import Database from 'better-sqlite3';
import { database as db } from '../config';

export type PackageType = {
  packageTypeName: string,
  registry: string,
};

export type PackageTypeResult = PackageType | undefined;

export const listPackageTypesFromDatabase = ():PackageType[] => {
  const stmt = db.prepare('SELECT package_type_name, registry FROM package_type');
  type Row = {
    package_type_name: string,
    registry: string,
  };
  return (stmt.all() as Row[]).map(({
    package_type_name: packageTypeName,
    registry,
  }): PackageType => ({
    packageTypeName,
    registry,
  }));
};

export const getPackageTypeFromDatabase = (packageTypeName: string): PackageTypeResult => {
  const stmt = db.prepare('SELECT registry FROM package_type WHERE package_type_name = ?');
  type Row = {
    registry: string,
  } | undefined;
  const result = stmt.get(packageTypeName) as Row;
  if (result) {
    return {
      packageTypeName,
      registry: result.registry,
    };
  }
  return undefined;
};

export const insertPackageTypeToDatabase = ({
  packageTypeName,
  registry,
}: PackageType): Database.RunResult => {
  if (getPackageTypeFromDatabase(packageTypeName)) {
    return { changes: 0, lastInsertRowid: 0 };
  }
  const stmt = db.prepare('INSERT INTO package_type (package_type_name, registry) VALUES (?, ?)');
  return stmt.run(packageTypeName, registry);
};

export const deletePackageTypeFromDatabase = (packageTypeName: string): Database.RunResult => {
  const stmt = db.prepare('DELETE FROM package_type WHERE package_type_name = ?;');
  return stmt.run(packageTypeName);
};
export const updatePackageTypeInDatabase = ({
  packageTypeName,
  registry,
}: PackageType): Database.RunResult => {
  if (!getPackageTypeFromDatabase(packageTypeName)) {
    return { changes: 0, lastInsertRowid: 0 };
  }
  const stmt = db.prepare('UPDATE package_type SET registry= ? WHERE package_type_name = ?;');
  return stmt.run(registry, packageTypeName);
};
