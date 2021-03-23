import Database from 'better-sqlite3';
import { database as db } from '../config';
import { PackageQuery } from './package';

export type Version = {
  version: string,
  publishTime: number
};

export type PackageVersion = {
  packageName: string,
  packageTypeName: string,
  version: string,
  publishTime: number
};

export type PackageWithVersions = {
  packageName: string,
  packageTypeName: string,
  versions: Version[]
} | undefined;

// get the first 50 results
export const listPackageVersionsFromDatabase = (): PackageVersion[] => {
  const stmt = db.prepare('SELECT package_name, package_type_name, version, publish_time FROM package_version ORDER BY publish_time DESC LIMIT 50');
  type Row = {
    package_name: string,
    package_type_name: string,
    version: string,
    publish_time: number
  };
  return (stmt.all() as Row[]).map(({
    package_name: packageName,
    package_type_name: packageTypeName,
    version,
    publish_time: publishTime,
  }): PackageVersion => ({
    packageName,
    packageTypeName,
    version,
    publishTime,
  }));
};

export const getPackageWithVersionsFromDatabase = ({
  packageName, packageTypeName,
}: PackageQuery): PackageWithVersions => {
  const stmt = db.prepare('SELECT version, publish_time FROM package_version WHERE package_name = ? AND package_type_name = ? ORDER BY publish_time DESC');
  type Row = {
    version: string,
    publish_time: number,
  };

  const versions = (stmt.all(packageName, packageTypeName) as Row[]).map(({
    version, publish_time: publishTime,
  }) => ({
    version,
    publishTime,
  }));
  if (versions.length > 0) {
    return {
      packageName,
      packageTypeName,
      versions,
    };
  }
  return undefined;
};

// export const insertPackageVersions = ({
//   packageName, packageTypeName, versions,
// }: Versions): void => {
//   const insert = db.prepare('INSERT INTO package_version \
//     (package_name, package_type_name, version, publish_time) \
//     VALUES (@packageName, @packageTypeName, @version, @publishTime)');
//   const insertMany = db.transaction((vs: Version[]) => {
//     for (const { version, publishTime } of vs) {
//       insert.run({
//         packageName, packageTypeName, version, publishTime,
//       });
//     }
//   });
//   return insertMany(versions);
// };

// TODO: deal with duplicate
export const insertPackageVersionsToDatabase = (versions: PackageVersion[]): Database.RunResult => {
  const v = versions.map(({
    packageName, packageTypeName, version, publishTime,
  }) => `('${packageName}', '${packageTypeName}', '${version}', ${publishTime})`);
  const stmt = db.prepare(`INSERT INTO package_version (package_name, package_type_name, version, publish_time) VALUES ${v.join(',')}`);
  return stmt.run();
};
