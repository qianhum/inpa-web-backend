import Database from 'better-sqlite3';
import { database as db } from '../config';
import { getPackageTypeFromDatabase } from './packageType';

export type Package = {
  packageName: string,
  packageTypeName: string,
  latestVersion: string,
  latestModifyTime: number,
  latestCheckTime: number,
};

export type PackageQuery = {
  packageName: string,
  packageTypeName: string,
};

export type PackageResult = Package | undefined;

export type UpdatePackageQuery = {
  packageName: string,
  packageTypeName: string,
  modified: boolean,
  latestVersion: string,
  latestModifyTime: number,
};

export const listPackagesFromDatabase = (): Package[] => {
  const stmt = db.prepare('SELECT package_name, package_type_name, latest_version, latest_modify_time, latest_check_time FROM package ORDER BY ROWID DESC');
  type Row = {
    package_name: string,
    package_type_name: string,
    latest_version: string,
    latest_modify_time: number,
    latest_check_time: number
  };
  return (stmt.all() as Row[]).map(({
    package_name: packageName,
    package_type_name: packageTypeName,
    latest_version: latestVersion,
    latest_modify_time: latestModifyTime,
    latest_check_time: latestCheckTime,
  }): Package => ({
    packageName,
    packageTypeName,
    latestVersion,
    latestModifyTime,
    latestCheckTime,
  }));
};

export const getPackageFromDatabase = ({
  packageName, packageTypeName,
}: PackageQuery): PackageResult => {
  const stmt = db.prepare('SELECT latest_version, latest_modify_time, latest_check_time FROM package WHERE package_name = ? AND package_type_name = ?');
  type Row = {
    latest_version: string,
    latest_modify_time: number,
    latest_check_time: number,
  } | undefined;
  const result = stmt.get(packageName, packageTypeName) as Row;
  if (result) {
    return {
      packageName,
      packageTypeName,
      latestVersion: result.latest_version,
      latestModifyTime: result.latest_modify_time,
      latestCheckTime: result.latest_check_time,
    };
  }
  return undefined;
};

export const insertPackageToDatabase = ({
  packageName,
  packageTypeName,
}: PackageQuery): Database.RunResult => {
  if (!getPackageTypeFromDatabase(packageTypeName)) {
    return { changes: 0, lastInsertRowid: 1 };
  }
  if (getPackageFromDatabase({ packageName, packageTypeName })) {
    return { changes: 0, lastInsertRowid: 0 };
  }
  const stmt = db.prepare('INSERT INTO package (package_name, package_type_name) VALUES (?, ?)');
  return stmt.run(packageName, packageTypeName);
};

export const updatePackageToDatabase = ({
  packageName,
  packageTypeName,
  modified,
  latestVersion,
  latestModifyTime,
}: UpdatePackageQuery): Database.RunResult => {
  if (modified) {
    const stmt = db.prepare('UPDATE package SET latest_version = ?, latest_modify_time = ?, latest_check_time = ? WHERE package_name = ? AND package_type_name = ?;');
    return stmt.run(latestVersion, latestModifyTime, Date.now(), packageName, packageTypeName);
  }
  const stmt = db.prepare('UPDATE package SET latest_check_time = ? WHERE package_name = ? AND package_type_name = ?;');
  return stmt.run(Date.now(), packageName, packageTypeName);
};

export const deletePackageFromDatabase = ({
  packageName,
  packageTypeName,
}: PackageQuery): Database.RunResult => {
  const stmt = db.prepare('DELETE FROM package WHERE package_name = ? AND package_type_name = ?;');
  return stmt.run(packageName, packageTypeName);
};
