import {
  prepareDatabase,
  dropTablesIfExists,
} from '../../src/utils/databaseOps';
import { insertPackageToDatabase } from '../../src/models/package';
import {
  listPackageVersionsFromDatabase,
  getPackageWithVersionsFromDatabase,
  insertPackageVersionsToDatabase,
} from '../../src/models/packageVersion';

beforeEach(() => {
  dropTablesIfExists();
  prepareDatabase();
  insertPackageToDatabase({ packageName: 'react', packageTypeName: 'npm' });
});

test('test listPackageVersionsFromDatabase and insertPackageVersionsToDatabase', () => {
  insertPackageVersionsToDatabase([
    {
      packageName: 'react',
      packageTypeName: 'npm',
      version: '17.0.0-rc.1',
      publishTime: 1598614483243,
    },
    {
      packageName: 'react',
      packageTypeName: 'npm',
      version: '17.0.0-rc.0',
      publishTime: 1597089567120,
    },
  ]);
  const result = listPackageVersionsFromDatabase();
  expect(result).toEqual([
    {
      packageName: 'react',
      packageTypeName: 'npm',
      version: '17.0.0-rc.1',
      publishTime: 1598614483243,
    },
    {
      packageName: 'react',
      packageTypeName: 'npm',
      version: '17.0.0-rc.0',
      publishTime: 1597089567120,
    },
  ]);
});

test('test listPackageVersionsFromDatabase with empty table', () => {
  const result = listPackageVersionsFromDatabase();
  expect(result).toEqual([]);
});

test('test getPackageWithVersionsFromDatabase and insertPackageVersionsToDatabase', () => {
  insertPackageVersionsToDatabase([
    {
      packageName: 'react',
      packageTypeName: 'npm',
      version: '17.0.0-rc.0',
      publishTime: 1597089567120,
    },
    {
      packageName: 'react',
      packageTypeName: 'npm',
      version: '17.0.0-rc.1',
      publishTime: 1598614483243,
    },
  ]);
  const result = getPackageWithVersionsFromDatabase({
    packageName: 'react',
    packageTypeName: 'npm',
  });
  expect(result).toEqual({
    packageName: 'react',
    packageTypeName: 'npm',
    versions: [
      {
        version: '17.0.0-rc.1',
        publishTime: 1598614483243,
      },
      {
        version: '17.0.0-rc.0',
        publishTime: 1597089567120,
      },
    ],
  });
});

test('test getPackageWithVersionsFromDatabase with empty table', () => {
  const result = getPackageWithVersionsFromDatabase({
    packageName: 'react',
    packageTypeName: 'npm',
  });
  expect(result).toBe(undefined);
});
