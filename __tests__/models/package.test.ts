import {
  prepareDatabase,
  dropTablesIfExists,
} from '../../src/utils/databaseOps';
import {
  listPackagesFromDatabase,
  getPackageFromDatabase,
  insertPackageToDatabase,
  updatePackageToDatabase,
  deletePackageFromDatabase,
  Package,
} from '../../src/models/package';

beforeEach(() => {
  dropTablesIfExists();
  prepareDatabase();
});

test('test listPackagesFromDatabase', () => {
  insertPackageToDatabase({
    packageTypeName: 'npm',
    packageName: 'react',
  });
  insertPackageToDatabase({
    packageTypeName: 'npm',
    packageName: 'vue',
  });
  const result = listPackagesFromDatabase();
  expect(result).toEqual([
    {
      packageTypeName: 'npm',
      packageName: 'vue',
      latestCheckTime: 0,
      latestModifyTime: 0,
      latestVersion: '',
    },
    {
      packageTypeName: 'npm',
      packageName: 'react',
      latestCheckTime: 0,
      latestModifyTime: 0,
      latestVersion: '',
    },
  ]);
});

test('test listPackagesFromDatabase with empty table', () => {
  const result = listPackagesFromDatabase();
  expect(result).toEqual([]);
});

test('test getPackageFromDatabase and insertPackageToDatabase', () => {
  insertPackageToDatabase({
    packageTypeName: 'npm',
    packageName: 'react',
  });
  const result = getPackageFromDatabase({
    packageTypeName: 'npm',
    packageName: 'react',
  });
  expect(result).toEqual({
    packageTypeName: 'npm',
    packageName: 'react',
    latestVersion: '',
    latestModifyTime: 0,
    latestCheckTime: 0,
  });
});

test('test getPackageFromDatabase with empty table', () => {
  const result = getPackageFromDatabase({
    packageTypeName: 'npm',
    packageName: 'react',
  });
  expect(result).toBe(undefined);
});

test('test insertPackageToDatabase when packageType does not exist in database', () => {
  const result = insertPackageToDatabase({
    packageTypeName: 'cnpm',
    packageName: 'react',
  });
  expect(result).toEqual({ changes: 0, lastInsertRowid: 1 });
});

test('test insertPackageToDatabase when duplicate item already in table', () => {
  insertPackageToDatabase({
    packageTypeName: 'npm',
    packageName: 'react',
  });
  const result = insertPackageToDatabase({
    packageTypeName: 'npm',
    packageName: 'react',
  });
  expect(result).toEqual({ changes: 0, lastInsertRowid: 0 });
});

test('test deletePackageFromDatabase', () => {
  insertPackageToDatabase({
    packageTypeName: 'npm',
    packageName: 'react',
  });
  deletePackageFromDatabase({
    packageTypeName: 'npm',
    packageName: 'react',
  });
  const result = getPackageFromDatabase({
    packageTypeName: 'npm',
    packageName: 'react',
  });
  expect(result).toBe(undefined);
});

test('test updatePackageToDatabase', () => {
  insertPackageToDatabase({
    packageTypeName: 'npm',
    packageName: 'react',
  });
  updatePackageToDatabase({
    packageTypeName: 'npm',
    packageName: 'react',
    modified: true,
    latestVersion: '17.0.0-rc.1',
    latestModifyTime: 1598614483243,
  });
  const { latestVersion, latestModifyTime } = getPackageFromDatabase({
    packageTypeName: 'npm',
    packageName: 'react',
  }) as Package;
  expect(latestVersion).toBe('17.0.0-rc.1');
  expect(latestModifyTime).toBe(1598614483243);
});

test('test updatePackageToDatabase with unmodified data', () => {
  insertPackageToDatabase({
    packageTypeName: 'npm',
    packageName: 'react',
  });
  updatePackageToDatabase({
    packageTypeName: 'npm',
    packageName: 'react',
    modified: false,
    latestVersion: '',
    latestModifyTime: 0,
  });
  const { latestVersion, latestModifyTime } = getPackageFromDatabase({
    packageTypeName: 'npm',
    packageName: 'react',
  }) as Package;
  expect(latestVersion).toBe('');
  expect(latestModifyTime).toBe(0);
});
