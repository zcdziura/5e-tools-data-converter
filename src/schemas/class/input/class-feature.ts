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
	UAClassFeatureVariants = 'UAClassFeatureVariants',
	UAModifyingClasses = 'UAModifyingClasses',
	UATheRangerRevised = 'UATheRangerRevised',
}

export interface EntryObject {
	type?: EntryObjectType;
	items?: string[];
	name?: string;
	entries?: Array<SubEntryObject | string>;
	classFeature?: string;
	caption?: string;
	colLabels?: string[];
	colStyles?: string[];
	rows?: Array<string[]>;
	count?: number;
}

export interface SubEntryObject {
	type: EntryObjectType;
	name?: Name;
	source?: string;
	entries?: Array<SubEntryObject | string>;
	optionalfeature?: string;
	caption?: string;
	colLabels?: string[];
	colStyles?: string[];
	rows?: Array<string[]>;
}

export enum EntryObjectType {
	AbilityAttackMod = 'abilityAttackMod',
	AbilityDc = 'abilityDc',
	Entries = 'entries',
	Inset = 'inset',
	List = 'list',
	Options = 'options',
	RefClassFeature = 'refClassFeature',
	RefOptionalfeature = 'refOptionalfeature',
	Table = 'table',
}

export enum Name {
	Spell = 'Spell',
	TheMagicOfArtifice = 'The Magic of Artifice',
}
