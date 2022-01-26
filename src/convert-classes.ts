import { walk } from 'https://deno.land/std@0.120.0/fs/mod.ts';

import { InputClassSchema } from './schemas/class/input/schema.ts';
import { Class } from './schemas/class/class.ts';
import { Source } from './schemas/class/input/class-feature.ts';

const classesDirectory: string = Deno.args[0];
const classes: Class[] = [];

for await (const entry of walk(classesDirectory)) {
	if (entry.isFile) {
		const schema: InputClassSchema = JSON.parse(await Deno.readTextFile(entry.path));
		const classFeatures = schema.classFeature.filter(
			feature => feature.source !== Source.UAModifyingClasses && feature.source !== Source.UATheRangerRevised
		);

		schema.class
			.filter(entry => entry.source.substring(0, 2) !== 'UA')
			.map(entry => new Class(entry, classFeatures))
			.forEach(entry => classes.push(entry));
	}
}

console.log(JSON.stringify(classes));
