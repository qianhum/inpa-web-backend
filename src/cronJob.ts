import { CronJob } from 'cron';
import { cron as cronConfig } from './config';
import { listPackagesFromDatabase } from './models/package';
import { fetchPackageVersions } from './handlers/packageVersion';

const cron = ():void => {
  const interval = 5000;

  const tasks = () => {
    const packages = listPackagesFromDatabase();
    packages.forEach(({ packageName, packageTypeName }, index) => {
      setTimeout(() => {
        fetchPackageVersions({ packageName, packageTypeName }).then(() => {}, () => {});
      }, index * interval);
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const job = new CronJob(cronConfig, () => {
    tasks();
  },
  null,
  true);
};

export default cron;
