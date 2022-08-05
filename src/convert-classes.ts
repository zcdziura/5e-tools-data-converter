import { walk } from 'https://deno.land/std@0.150.0/fs/mod.ts';

import { Class } from './schemas/class/class.ts';
import { Source } from './schemas/class/input/class-feature.ts';
import { InputClassSchema } from './schemas/class/input/schema.ts';
import { OptionalFeature } from './schemas/optional-features/optional-feature.ts';

const classesDirectory: string = Deno.args[0];
const optionalFeaturesFile: string = Deno.args[1];
const classes: Class[] = [];

const optionalFeatures: Map<string, OptionalFeature> = (
	JSON.parse(await Deno.readTextFile(optionalFeaturesFile)) as { optionalfeature: OptionalFeature[] }
).optionalfeature
	.filter(feature => feature.source.substring(0, 2).toLowerCase() !== 'ua')
	.reduce((optionalFeatures, feature) => optionalFeatures.set(feature.name, feature), new Map());

(JSON.parse(await Deno.readTextFile(optionalFeaturesFile)) as { optionalfeature: OptionalFeature[] }).optionalfeature
	.filter(feature => feature.source.substring(0, 2).toLowerCase() !== 'ua')
	.forEach(feature => optionalFeatures.set(feature.name, feature));

for await (const entry of walk(classesDirectory)) {
	if (entry.isFile) {
		const schema: InputClassSchema = JSON.parse(await Deno.readTextFile(entry.path));
		const classFeatures = schema.classFeature.filter(
			feature => feature.source === Source.Phb || feature.source === Source.Tce
		);

		schema.class
			.filter(entry => entry.source.substring(0, 2) !== 'UA')
			.map(entry => new Class(entry, classFeatures, optionalFeatures))
			.forEach(entry => classes.push(entry));
	}
}

classes.sort((a, b) => {
	if (a.name > b.name) {
		return 1;
	} else if (a.name < b.name) {
		return -1;
	} else {
		return 0;
	}
});

console.log(JSON.stringify(classes));
