export interface ClassFeature {
	name: string;
	source: Source;
	page: number;
	className: ClassName;
	level: number;
	entries: Array<EntryObject | string>;
	header?: number;
	srd?: boolean;
	isClassFeatureVariant?: boolean;
	basicRules?: boolean;
}

export enum ClassName {
	Artificer = 'Artificer',
	Barbarian = 'Barbarian',
	Bard = 'Bard',
	Cleric = 'Cleric',
	Druid = 'Druid',
	Fighter = 'Fighter',
	Monk = 'Monk',
	Paladin = 'Paladin',
	Ranger = 'Ranger',
	RangerRevised = 'Ranger (Revised)',
	RangerSpellLess = 'Ranger (Spell-less)',
	Rogue = 'Rogue',
	Sorcerer = 'Sorcerer',
	Warlock = 'Warlock',
	Wizard = 'Wizard',
}

export enum Source {
	Phb = 'PHB',
	Tce = 'TCE',
	UAModifyingClasses = 'UAModifyingClasses',
	UATheRangerRevised = 'UATheRangerRevised',
}

export interface EntryObject {
	type: PurpleType;
	items?: string[];
	name?: string;
	entries?: Array<FluffyEntry | string>;
	classFeature?: string;
	caption?: string;
	colLabels?: string[];
	colStyles?: string[];
	rows?: Array<string[]>;
	count?: number;
}

export interface FluffyEntry {
	type: FluffyType;
	name?: Name;
	entries?: Array<TentacledEntry | string>;
	optionalfeature?: string;
	caption?: string;
	colLabels?: string[];
	colStyles?: string[];
	rows?: Array<string[]>;
}

export interface TentacledEntry {
	type: PurpleType;
	name: string;
	entries: Array<StickyEntry | string>;
}

export interface StickyEntry {
	type: PurpleType;
	name: string;
	source: string;
	page: number;
	entries: string[];
}

export enum PurpleType {
	AbilityDc = 'abilityDc',
	Entries = 'entries',
	Inset = 'inset',
	List = 'list',
	Options = 'options',
	RefClassFeature = 'refClassFeature',
	Table = 'table',
}

export enum Name {
	Spell = 'Spell',
	TheMagicOfArtifice = 'The Magic of Artifice',
}

export enum FluffyType {
	AbilityAttackMod = 'abilityAttackMod',
	AbilityDc = 'abilityDc',
	Entries = 'entries',
	Inset = 'inset',
	RefOptionalfeature = 'refOptionalfeature',
	Table = 'table',
}
