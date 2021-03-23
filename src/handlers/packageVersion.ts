import got from 'got';

import {
  PackageQuery, getPackageFromDatabase, updatePackageToDatabase,
} from '../models/package';
import { getPackageTypeFromDatabase } from '../models/packageType';
import {
  PackageVersion,
  insertPackageVersionsToDatabase,
} from '../models/packageVersion';

type DataToUpdateResult = {
  modified: boolean,
  latestModifyTime: number,
  latestVersion: string,
  packageVersions: PackageVersion[],
} | undefined;

export const fetchDataToUpdate = async ({
  packageName,
  packageTypeName,
}:PackageQuery): Promise<DataToUpdateResult> => {
  const packageType = getPackageTypeFromDatabase(packageTypeName);
  const packageResult = getPackageFromDatabase({ packageName, packageTypeName });
  if (!packageType || !packageResult) {
    return undefined;
  }
  const { registry } = packageType;
  const { latestModifyTime: oldModifyTime } = packageResult;
  let modified = false;
  let latestModifyTime = 0;
  let latestVersion = '';
  let latestVersionTime = 0;
  let packageVersions: PackageVersion[] = [];
  try {
    const response = await got(`${registry}/${packageName}`);

    type ResponseBody = {
      time: {
        modified: string,
      },
      versions: {
        [key: string]: {
          publish_time: number,
        }
      }
    };
    const { time, versions } = JSON.parse(response.body) as ResponseBody;
    latestModifyTime = Date.parse(time.modified);
    if (latestModifyTime > oldModifyTime) {
      modified = true;
      packageVersions = Object.keys(versions).reduce((result: PackageVersion[], key) => {
        if (versions[key].publish_time > oldModifyTime) {
          if (versions[key].publish_time > latestVersionTime) {
            latestVersion = key;
            latestVersionTime = versions[key].publish_time;
          }
          result.push({
            packageName,
            packageTypeName,
            version: key,
            publishTime: versions[key].publish_time,
          });
        }
        return result;
      }, []);
    }
    const parseDate = (n: number) => (new Date(n)).toLocaleString();
    if (!modified) {
      console.log(`${(new Date()).toLocaleString()} - ${packageTypeName}: ${packageName} has no update`);
    } else {
      console.log(`${(new Date()).toLocaleString()} - ${packageTypeName}: ${packageName} gets ${packageVersions.length} update${packageVersions.length > 1 ? 's' : ''}, the latest update is ${latestVersion} at ${parseDate(latestVersionTime)}`);
    }
  } catch (error) {
    // TODO: handle error
    // console.log(JSON.stringify(error));
  }
  return {
    modified,
    latestModifyTime,
    latestVersion,
    packageVersions,
  };
};

export const fetchPackageVersions = async ({
  packageName,
  packageTypeName,
}: PackageQuery): Promise<string> => {
  const dataToUpdate = await fetchDataToUpdate({
    packageName, packageTypeName,
  });
  if (!dataToUpdate) {
    return 'package or packageType does not exist in database';
  }
  const {
    modified, latestModifyTime, latestVersion, packageVersions,
  } = dataToUpdate;
  updatePackageToDatabase({
    packageName, packageTypeName, modified, latestModifyTime, latestVersion,
  });
  if (!modified) {
    return 'package not updated';
  }
  insertPackageVersionsToDatabase(packageVersions);
  return 'package updated';
};
