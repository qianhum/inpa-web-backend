import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { port } from './config';
import {
  listPackagesFromDatabase,
  getPackageFromDatabase,
  deletePackageFromDatabase,
  insertPackageToDatabase,
} from './models/package';
import {
  listPackageTypesFromDatabase,
  getPackageTypeFromDatabase,
  updatePackageTypeInDatabase,
} from './models/packageType';
import {
  listPackageVersionsFromDatabase,
  getPackageWithVersionsFromDatabase,
} from './models/packageVersion';
import {
  fetchPackageVersions,
} from './handlers/packageVersion';

const server = ():void => {
  const app = express();

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cors());

  app.get('/', (req, res) => {
    res.json({
      status: 'ok',
    });
  });

  // list packageTypes
  app.get('/package_types', (req, res) => {
    res.json({ packageTypes: listPackageTypesFromDatabase() });
  });

  // get packageType by packageTypeName
  app.get('/package_type/:packageTypeName', ({ params: { packageTypeName } }, res) => {
    res.json({ packageType: getPackageTypeFromDatabase(packageTypeName) });
  });

  // update packageType
  app.patch('/package_type/:packageTypeName', ({ params: { packageTypeName }, body }, res) => {
    type Body = {
      registry: string
    };
    if (Object.keys(body).length === 0) {
      res.json({ message: 'body data is required' });
    } else if (!(body as Body).registry) {
      res.json({ message: 'registry in body data is required' });
    } else {
      const result = updatePackageTypeInDatabase({
        packageTypeName, registry: (body as Body).registry,
      });
      if (result.changes === 0) {
        res.json({ message: 'packageType does not exist in database' });
      } else {
        res.json({ message: 'packageType successfully updated' });
      }
    }
  });

  // list packages
  app.get('/packages', (req, res) => {
    res.json({ packages: listPackagesFromDatabase() });
  });

  // get package by packageName and packageTypeName
  app.get('/package/:packageTypeName/:packageName', ({
    params: { packageName, packageTypeName },
  }, res) => {
    res.json({
      package: getPackageFromDatabase({ packageName, packageTypeName }),
    });
  });

  // add package
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  app.post('/package/:packageTypeName/:packageName', async ({
    params: { packageName, packageTypeName },
  }, res) => {
    const result = insertPackageToDatabase({ packageName, packageTypeName });
    if (result.changes !== 0) {
      await fetchPackageVersions({ packageName, packageTypeName });
      res.status(201);
      res.json({ message: 'package successfully added' });
    } else if (result.lastInsertRowid === 0) {
      res.status(409);
      res.json({ message: 'package already in database' });
    } else {
      res.status(409);
      res.json({ message: 'packageType does not exist in database' });
    }
  });

  // remove package
  app.delete('/package/:packageTypeName/:packageName', ({
    params: { packageName, packageTypeName },
  }, res) => {
    deletePackageFromDatabase({ packageName, packageTypeName });
    res.sendStatus(204);
  });

  // get versions (by time)
  app.get('/package_versions', (req, res) => {
    res.json({ packageVersions: listPackageVersionsFromDatabase() });
  });

  // get versions by packageName and packageTypeName
  app.get('/package_versions/:packageTypeName/:packageName', ({
    params: { packageName, packageTypeName },
  }, res) => {
    res.json(getPackageWithVersionsFromDatabase({ packageName, packageTypeName }));
  });

  app.listen(port, () => {
    console.log(`listening port ${port}`);
  });
};

export default server;
