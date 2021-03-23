import Database from 'better-sqlite3';
import { database as db, npmRegistry } from '../config';
import { listPackageTypesFromDatabase } from '../models/packageType';

export const createTablesIfNotExists = ():void => {
  const createPackageTypeStmt = db.prepare('CREATE TABLE IF NOT EXISTS package_type(package_type_name TEXT UNIQUE, registry TEXT);');
  const createPackageStmt = db.prepare(`CREATE TABLE IF NOT EXISTS package(
    package_name TEXT,
    package_type_name TEXT,
    latest_version TEXT DEFAULT '',
    latest_modify_time INTEGER DEFAULT 0,
    latest_check_time INTEGER DEFAULT 0,
    UNIQUE(package_name, package_type_name),
    FOREIGN KEY(package_type_name) REFERENCES package_type(package_type_name) ON UPDATE CASCADE ON DELETE CASCADE
  );`);
  const createPackageVersionStmt = db.prepare(`CREATE TABLE IF NOT EXISTS package_version(
    package_name TEXT,
    package_type_name TEXT,
    version TEXT,
    publish_time INTEGER,
    UNIQUE(package_name, package_type_name, version),
    FOREIGN KEY(package_name, package_type_name) REFERENCES package(package_name, package_type_name) ON UPDATE CASCADE ON DELETE CASCADE
  );`);
  createPackageTypeStmt.run();
  createPackageStmt.run();
  createPackageVersionStmt.run();
};

export const dropTablesIfExists = ():void => {
  const dropPackageTypeStmt = db.prepare('DROP TABLE IF EXISTS package_type;');
  const dropPackageStmt = db.prepare('DROP TABLE IF EXISTS package;');
  const dropPackageVersionStmt = db.prepare('DROP TABLE IF EXISTS package_version;');
  dropPackageTypeStmt.run();
  dropPackageStmt.run();
  dropPackageVersionStmt.run();
};

export const insertDefaultPackageTypes = ():Database.RunResult => {
  const stmt = db.prepare(`INSERT INTO package_type (package_type_name, registry)
  VALUES('npm', ?);`);
  return stmt.run(npmRegistry);
};

export const prepareDatabase = ():void => {
  createTablesIfNotExists();
  const packageTypes = listPackageTypesFromDatabase();
  if (packageTypes.length === 0) {
    insertDefaultPackageTypes();
  }
};
