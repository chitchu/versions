const fs = require('fs');
const path = require('path');

const packages = fs.readdirSync(path.join(__dirname, 'node_modules'));
const exclude = ['.bin', '.cache'];

const currentPackage = require('./package.json');
const depKeys = Object.keys(currentPackage.dependencies);
const devDepKeys = Object.keys(currentPackage.devDependencies);
const combinedDeps = depKeys.concat(devDepKeys);

const versions = packages
  .filter(package => !exclude.includes(package))
  .filter(package => combinedDeps.includes(package))
  .reduce(
    (acc, current) => {
      try {
        const packageDir = path.resolve(__dirname, 'node_modules', current);
        const { name, version } = require(`${packageDir}/package.json`);
        if (depKeys.includes(name)) {
          return Object.assign(acc, {
            dependencies: Object.assign(acc.dependencies, { [name]: version }),
          });
        } else {
          return Object.assign(acc, {
            devDependencies: Object.assign(acc.devDependencies, {
              [name]: version,
            }),
          });
        }
      } catch (e) {
        // noop
        console.log(e);
        return acc;
      }
    },
    { dependencies: {}, devDependencies: {} }
  );

fs.writeFileSync('versions.json', JSON.stringify(versions));
