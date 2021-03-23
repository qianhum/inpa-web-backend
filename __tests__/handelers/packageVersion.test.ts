import got from 'got';
import { mocked } from 'ts-jest/utils';
import {
  prepareDatabase,
  dropTablesIfExists,
} from '../../src/utils/databaseOps';
import { insertPackageToDatabase } from '../../src/models/package';
import {
  fetchDataToUpdate, fetchPackageVersions,
} from '../../src/handlers/packageVersion';

jest.mock('got');

beforeEach(() => {
  dropTablesIfExists();
  prepareDatabase();
});

test('test fetchDataToUpdate', async () => {
  const body = `{
    "time": {
      "modified": "2020-08-28T11:35:00.000Z"
    },
    "versions": {
      "17.0.0-rc.1": {
        "publish_time": 1598614483243
      },
      "17.0.0-rc.0": {
        "publish_time": 1597089567120
      }
    }
  }`;
  mocked(got).mockResolvedValue({ body });
  insertPackageToDatabase({ packageName: 'react', packageTypeName: 'npm' });
  const result = await fetchDataToUpdate({ packageName: 'react', packageTypeName: 'npm' });
  expect(result).toEqual({
    modified: true,
    latestModifyTime: 1598614500000,
    latestVersion: '17.0.0-rc.1',
    packageVersions: [
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
    ],
  });
});

test('test fetchDataToUpdate with new update', async () => {
  const body = `{
    "time": {
      "modified": "2020-08-10T19:59:57.120Z"
    },
    "versions": {
      "17.0.0-rc.0": {
        "publish_time": 1597089567120
      },
      "16.13.1": {
        "publish_time": 1584647593309
      }
    }
  }`;
  const newBody = `{
    "time": {
      "modified": "2020-08-28T11:35:00.000Z"
    },
    "versions": {
      "17.0.0-rc.1": {
        "publish_time": 1598614483243
      },
      "17.0.0-rc.0": {
        "publish_time": 1597089567120
      },
      "16.13.1": {
        "publish_time": 1584647593309
      }
    }
  }`;
  mocked(got).mockResolvedValue({ body });
  insertPackageToDatabase({ packageName: 'react', packageTypeName: 'npm' });
  await fetchPackageVersions({ packageName: 'react', packageTypeName: 'npm' });
  mocked(got).mockResolvedValue({ body: newBody });
  const result = await fetchDataToUpdate({ packageName: 'react', packageTypeName: 'npm' });
  expect(result).toEqual({
    modified: true,
    latestModifyTime: 1598614500000,
    latestVersion: '17.0.0-rc.1',
    packageVersions: [
      {
        packageName: 'react',
        packageTypeName: 'npm',
        version: '17.0.0-rc.1',
        publishTime: 1598614483243,
      },
    ],
  });
});

test('test fetchDataToUpdate when package or packageType does not exist in database', async () => {
  const body = `{
    "time": {
      "modified": "2020-08-28T11:35:00.000Z"
    },
    "versions": {
      "17.0.0-rc.1": {
        "publish_time": 1598614483243
      },
      "17.0.0-rc.0": {
        "publish_time": 1597089567120
      }
    }
  }`;
  mocked(got).mockResolvedValue({ body });
  insertPackageToDatabase({ packageName: 'react', packageTypeName: 'npm' });
  let result = await fetchDataToUpdate({ packageName: 'vue', packageTypeName: 'npm' });
  expect(result).toBe(undefined);
  result = await fetchDataToUpdate({ packageName: 'react', packageTypeName: 'cnpm' });
  expect(result).toBe(undefined);
});

test('test fetchPackageVersions', async () => {
  const body = `{
    "time": {
      "modified": "2020-08-28T11:35:00.000Z"
    },
    "versions": {
      "17.0.0-rc.1": {
        "publish_time": 1598614483243
      },
      "17.0.0-rc.0": {
        "publish_time": 1597089567120
      }
    }
  }`;
  mocked(got).mockResolvedValue({ body });
  insertPackageToDatabase({ packageName: 'react', packageTypeName: 'npm' });
  const result = await fetchPackageVersions({ packageName: 'react', packageTypeName: 'npm' });
  expect(result).toBe('package updated');
});

test('test fetchDataToUpdate when package or packageType does not exist in database', async () => {
  const body = `{
    "time": {
      "modified": "2020-08-28T11:35:00.000Z"
    },
    "versions": {
      "17.0.0-rc.1": {
        "publish_time": 1598614483243
      },
      "17.0.0-rc.0": {
        "publish_time": 1597089567120
      }
    }
  }`;
  mocked(got).mockResolvedValue({ body });
  insertPackageToDatabase({ packageName: 'react', packageTypeName: 'npm' });
  let result = await fetchPackageVersions({ packageName: 'vue', packageTypeName: 'npm' });
  expect(result).toBe('package or packageType does not exist in database');
  result = await fetchPackageVersions({ packageName: 'react', packageTypeName: 'cnpm' });
  expect(result).toBe('package or packageType does not exist in database');
});

test('test fetchPackageVersions when no new update available', async () => {
  const body = `{
    "time": {
      "modified": "2020-08-28T11:35:00.000Z"
    },
    "versions": {
      "17.0.0-rc.1": {
        "publish_time": 1598614483243
      },
      "17.0.0-rc.0": {
        "publish_time": 1597089567120
      }
    }
  }`;
  mocked(got).mockResolvedValue({ body });
  insertPackageToDatabase({ packageName: 'react', packageTypeName: 'npm' });
  await fetchPackageVersions({ packageName: 'react', packageTypeName: 'npm' });
  const result = await fetchPackageVersions({ packageName: 'react', packageTypeName: 'npm' });
  expect(result).toBe('package not updated');
});
