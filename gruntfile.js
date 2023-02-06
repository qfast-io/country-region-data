var _ = require('underscore');
var libumd = require('libumd');

var findDuplicates = function (sourceArray, prop) {
	var duplicates = [];
	var groupedByCount = _.countBy(sourceArray, function (item) {
		return item[prop];
	});

	for (var name in groupedByCount) {
		if (groupedByCount[name] > 1) {
			var whereClause = [];
			whereClause[prop] = name;
			_.where(sourceArray, whereClause).map(function (item) {
				duplicates.push(item);
			});
		}
	}

	return _.uniq(_.pluck(duplicates, prop));
};

var getJSON = function (grunt) {
	var content = '';
	try {
		content = grunt.file.readJSON('data.json');
	} catch (e) {
		grunt.fail.fatal('data.json is not valid JSON. Error: ' + e);
	}
	return content;
};


module.exports = function (grunt) {

	function validate () {
		var content = getJSON(grunt);

		// check country names and country shortcodes are unique
		var duplicateCountryNames = findDuplicates(content, 'countryName');
		if (duplicateCountryNames.length > 0) {
			grunt.fail.fatal('The country names are not unique - duplicates: ' + duplicateCountryNames);
		}
		var duplicateCountryShortCodes = findDuplicates(content, 'countryShortCode');
		if (duplicateCountryShortCodes.length > 0) {
			grunt.fail.fatal('The country short codes are not unique - duplicates: ' + duplicateCountryShortCodes);
		}

		// now check region names and short codes are unique for each country
		content.forEach(function (countryData) {
			var duplicateRegionNames = findDuplicates(countryData.regions, 'name');
			if (duplicateRegionNames.length > 0) {
				grunt.fail.fatal('The region names for ' + countryData.countryName + ' are not unique - duplicates: ' + duplicateRegionNames);
			}
			var duplicateRegionShortCodes = findDuplicates(countryData.regions, 'shortCode');
			if (duplicateRegionShortCodes.length > 0) {
				grunt.fail.fatal('The region names for ' + countryData.countryName + ' are not unique - duplicates: ' + duplicateRegionShortCodes);
			}
		});
		console.log('PASS!');
	}


	function findIncomplete () {
		var content = getJSON(grunt);

		var incompleteCountries = [];
		content.forEach(function (countryData) {
			for (var i = 0; i < countryData.regions.length; i++) {
				if (!_.has(countryData.regions[i], 'shortCode')) {
					incompleteCountries.push(countryData.countryName);
					break;
				}
			}
		});

		if (incompleteCountries.length > 0) {
			console.log('\nThe following countries are missing region short codes: \n-', incompleteCountries.join('\n- '));
			console.log('\n(' + incompleteCountries.length + ' countries)');
		} else {
			console.log('All regions now have short codes. Nice!');
		}
	}

	function umdify() {
		var content = getJSON(grunt);

		var output = libumd('return ' + JSON.stringify(content, null, 2) + ';', {
			globalAlias: 'countryRegionData',
			indent: 2
		});

		const file = 'dist/data-umd.js';
		grunt.file.write(file, output);

		console.log(`UMD module created: ${file}`);
	}


	function es6ify() {
		var content = getJSON(grunt);
		let output = '';
		const countryEnNames = content.map(({ countryName }) => countryName);
		const countryArNames = content.map(({ countryName, countryNameAr }) => countryNameAr ? countryNameAr : countryName);
		const countryCodes = content.map(({ countryShortCode }) => countryShortCode);

		output += `export const countriesMap = new Map([\n`;
		content.map(({ countryName, countryNameAr, countryShortCode, regions }) => {
			output += `[\n\t"${countryShortCode}", {\n\t\tdisplayEn: "${countryName}",\n\t\tdisplayAr: "${countryNameAr ? countryNameAr : countryName}",\n\t\tvalue:"${countryShortCode}",\n\t\tregions:[\n${regions.map(({ name, nameAr, shortCode }) => `\t\t\t{displayEn:"${name}", displayAr:"${nameAr ? nameAr : name}", value:"${shortCode}"}`).join(",\n")}\n\t\t]\n\t}\n],\n`;
		});
		output +=`]);\n`;

		output += `export const countries = [\n`
		content.map(({ countryName, countryNameAr, countryShortCode, regions }) => {
			output += `\t{\n\t\tdisplayEn: "${countryName}",\n\t\tdisplayAr: "${countryNameAr ? countryNameAr : countryName}",\n\t\tvalue:"${countryShortCode}",\n\t\tregions:[\n${regions.map(({ name, nameAr, shortCode }) => `\t\t\t{displayEn:"${name}", displayAr:"${nameAr ? nameAr : name}", value:"${shortCode}"}`).join(",\n")}\n\t\t]\n\t},\n`;
		});
		output +=`];\n`;

		const file = 'dist/data.js';
		grunt.file.write(file, output);

		// now generate the corresponding typings file
		let typingsOutput = `declare module '@qfast/country-region-data' {
	export type CountryNameEn = "${countryEnNames.join('" | "')}";\n
	export type CountryNameAr = "${countryArNames.join('" | "')}";\n`;
		typingsOutput += `\texport type CountryCode = "${countryCodes.join('" | "')}";\n`;
		typingsOutput += `\texport const countryEnNames: CountryNameEn[];
	export const countryArNames: CountryNameAr[];
	export const countryCodes: CountryCode[];
	export type Region = {
		displayEn: string,
		displayAr: string,
		value: string
	};
	
	export type CountryData = {
		displayEn: CountryNameEn,
		displayAr: CountryNameAr,
		value: CountryCode,
		regions: Region[]
	};
	
	export const countries: CountryData[];	
	export const countriesMap:  Map<string, CountryData>;	
	export default countries;
`;
		typingsOutput += '\n}\n';

		const typingsFile = 'dist/data.d.ts';
		grunt.file.write(typingsFile, typingsOutput);

		console.log(`ES6 module created: ${file}`);
	}

	grunt.registerTask('default', ['validate']);
	grunt.registerTask('validate', validate);
	grunt.registerTask('findIncomplete', findIncomplete);
	grunt.registerTask('build', ['umdify', 'es6ify']);
	grunt.registerTask('umdify', umdify);
	grunt.registerTask('es6ify', es6ify);
};
