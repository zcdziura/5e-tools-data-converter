import { ClassFeature } from './class-feature.ts';
import { Class } from './class.ts';

export interface InputClassSchema {
	class: Class[];
	classFeature: ClassFeature[];
}
