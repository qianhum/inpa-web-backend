import { database as db, npmRegistry } from '../../src/config';
import {
  createTablesIfNotExists,
  dropTablesIfExists,
  insertDefaultPackageTypes,
  prepareDatabase,
} from '../../src/utils/databaseOps';

beforeEach(() => {
  dropTablesIfExists();
});

test('test createTablesIfNotExists', () => {
  createTablesIfNotExists();
  const stmt = db.prepare('SELECT * FROM sqlite_master WHERE type = \'table\' AND name = ?');
  type Row = {
    tbl_name: string,
  };
  const { tbl_name: packageTypeTableName } = stmt.get('package_type') as Row;
  const { tbl_name: packageTableName } = stmt.get('package') as Row;
  const { tbl_name: packageVersionTableName } = stmt.get('package_version') as Row;
  expect(packageTypeTableName).toBe('package_type');
  expect(packageTableName).toBe('package');
  expect(packageVersionTableName).toBe('package_version');
});

test('test dropTablesIfExists', () => {
  createTablesIfNotExists();
  dropTablesIfExists();
  const stmt = db.prepare('SELECT * FROM sqlite_master WHERE type = \'table\' AND name = ?');
  expect(stmt.get('package_type')).toBe(undefined);
  expect(stmt.get('package')).toBe(undefined);
  expect(stmt.get('package_version')).toBe(undefined);
});

test('test insertDefaultPackageTypes', () => {
  createTablesIfNotExists();
  insertDefaultPackageTypes();
  const stmt = db.prepare('SELECT * FROM package_type WHERE package_type_name = ?');
  type Row = {
    registry: string,
  };
  const { registry } = stmt.get('npm') as Row;
  expect(registry).toBe(npmRegistry);
});

test('test prepareDatabase', () => {
  prepareDatabase();
  const stmt = db.prepare('SELECT * FROM package_type WHERE package_type_name = ?');
  type Row = {
    registry: string,
  };
  const { registry } = stmt.get('npm') as Row;
  expect(registry).toBe(npmRegistry);
});

test('test prepareDatabase when table package_type is not empty', () => {
  createTablesIfNotExists();
  insertDefaultPackageTypes();
  prepareDatabase();
  const stmt = db.prepare('SELECT * FROM package_type');
  type Row = {
    registry: string,
  };
  const rows = stmt.all() as Row[];
  expect(rows).toEqual([
    {
      package_type_name: 'npm',
      registry: npmRegistry,
    },
  ]);
});
