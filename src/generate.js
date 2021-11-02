const path = require('path');
const fs = require('fs-extra');
const fg = require('fast-glob');
// const parseColorManifest = require('./parse-color-manifest');
const getColorsWithPlatformOverrides = require('./include-platform-overrides');
const { formatName } = require('./utils');

const generators = {
  ios: require('./templates/ios'),
  android: require('./templates/android'),
  css: require('./templates/css'),
  javascript: require('./templates/javascript'),
};

async function generate(config) {
  const colors = getColorsWithPlatformOverrides(config) // now colors is a map { platform: colors[] }
  const { outputDirectory } = config.ios;
  const prefix = formatName('ios', config);

  const entries = await fg(`${path.join(outputDirectory, prefix)}*`, {
    onlyFiles: false,
  });

  await Promise.all(
    entries.map(async (dir) => {
      const exist = await fs.pathExists(dir);
      if (exist) {
        await fs.remove(dir);
      }
    })
  );

  const output = Object.keys(generators)
    .filter((platform) => config[platform])
    .reduce((acc, platform) => {
      const { outputDirectory } = config[platform];

      const generator = generators[platform];
      // need to use platform specific list for generator !
      const files = generator(colors[platform], config).map(([filename, contents]) => [
        path.resolve(outputDirectory, filename),
        contents,
      ]);

      return acc.concat(files);
    }, []);

  await Promise.all(
    output.map(([filename, contents]) => fs.outputFile(filename, contents))
  );

  return colors['default']; // return default parsed colors list so that methods dependent on output of generate don't break
}

module.exports = generate;
