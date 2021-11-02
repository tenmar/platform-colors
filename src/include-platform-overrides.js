
const parseColorManifest = require('./parse-color-manifest');

// all possible platforms
const platforms = ['javascript', 'ios', 'android', 'css']

/**
 * Method to help parse optional platform-specific overrides where necessary, but otherwise leave the 
 * expected color config generation unaffected for that platform. Note the format of the return type.
 * 
 * @param config The configuration file containing 'colors' and platform options and, optionally, an 'overrides' entry in the form of:
 * 
 *  "overrides": {
 * 
 *      'platform_name': { 'color_name' : 'color_value' }
 * 
 *  }
 * 
 * @returns map of platform names to parsed colors lists, with result['default'] = parseColorManifest(config.colors)
 */
const getColorsWithPlatformOverrides = (config) => {

    // always append base, this is our default 
    const defaultColors = parseColorManifest(config.colors)
    // define out platform -> parsed colors list map
    let platformColorMap = { 'default' : defaultColors } // default always points to the way colors are originally generated
    
    // only use platforms defined in config 
    platforms.filter(platform => config[platform])
        .forEach(platform => {
            if (config.overrides && config.overrides[platform]) {
                const platformColors = {...config.colors} // copy all base color mappings

                const overrideColorsRaw = config.overrides[platform] // get overrides for specific platform
                Object.keys(overrideColorsRaw)
                    .filter(name => platformColors[name]) // keep only overrides that correspond with base colors (otherwise ... why is it an override if it doesn't exist in base?)
                    .forEach(name => {
                        platformColors[name] = overrideColorsRaw[name] // override color in base
                    })
                // parse the final list
                platformColorMap[platform] = parseColorManifest(platformColors)
            } else {
                // no overrides ? just use pre-parsed base colors list
                platformColorMap[platform] = defaultColors
            }
        })

    
    // return platform specific mapping
    return platformColorMap
}

module.exports = getColorsWithPlatformOverrides