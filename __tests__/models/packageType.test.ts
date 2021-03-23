import {
  createTablesIfNotExists,
  dropTablesIfExists,
} from '../../src/utils/databaseOps';
import {
  listPackageTypesFromDatabase,
  getPackageTypeFromDatabase,
  insertPackageTypeToDatabase,
  deletePackageTypeFromDatabase,
  updatePackageTypeInDatabase,
} from '../../src/models/packageType';

beforeEach(() => {
  dropTablesIfExists();
  createTablesIfNotExists();
});

test('test listPackageTypesFromDatabase', () => {
  insertPackageTypeToDatabase({ packageTypeName: 'npm', registry: 'https://registry.npmjs.org' });
  insertPackageTypeToDatabase({ packageTypeName: 'cnpm', registry: 'https://registry.npm.taobao.org' });
  const result = listPackageTypesFromDatabase();
  expect(result).toEqual([
    { packageTypeName: 'npm', registry: 'https://registry.npmjs.org' },
    { packageTypeName: 'cnpm', registry: 'https://registry.npm.taobao.org' },
  ]);
});

test('test listPackageTypesFromDatabase with empty table', () => {
  const result = listPackageTypesFromDatabase();
  expect(result).toEqual([]);
});

test('test getPackageTypeFromDatabase and insertPackageTypeToDatabase', () => {
  insertPackageTypeToDatabase({ packageTypeName: 'npm', registry: 'https://registry.npmjs.org' });
  const result = getPackageTypeFromDatabase('npm');
  expect(result).not.toBe(undefined);
  expect(result?.registry).toBe('https://registry.npmjs.org');
});

test('test insertPackageTypeToDatabase when duplicate item already in table', () => {
  insertPackageTypeToDatabase({ packageTypeName: 'npm', registry: 'https://registry.npmjs.org' });
  const result = insertPackageTypeToDatabase({ packageTypeName: 'npm', registry: 'https://registry.npmjs.org' });
  expect(result).toEqual({ changes: 0, lastInsertRowid: 0 });
});

test('test getPackageTypeFromDatabase with empty table', () => {
  const result = getPackageTypeFromDatabase('npm');
  expect(result).toBe(undefined);
});

test('test deletePackageTypeFromDatabase', () => {
  insertPackageTypeToDatabase({ packageTypeName: 'npm', registry: 'https://registry.npmjs.org' });
  deletePackageTypeFromDatabase('npm');
  const result = getPackageTypeFromDatabase('npm');
  expect(result).toBe(undefined);
});

test('test updatePackageTypeInDatabase', () => {
  insertPackageTypeToDatabase({ packageTypeName: 'npm', registry: 'https://registry.npmjs.org' });
  updatePackageTypeInDatabase({ packageTypeName: 'npm', registry: 'https://registry.npm.taobao.org' });
  const result = getPackageTypeFromDatabase('npm');
  expect(result).toEqual({ packageTypeName: 'npm', registry: 'https://registry.npm.taobao.org' });
});

test('test updatePackageTypeInDatabase when packageTypeName does not exist in database', () => {
  const result = updatePackageTypeInDatabase({ packageTypeName: 'cnpm', registry: 'https://registry.npm.taobao.org' });
  expect(result).toEqual({ changes: 0, lastInsertRowid: 0 });
});
