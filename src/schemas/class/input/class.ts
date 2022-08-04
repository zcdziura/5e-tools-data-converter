export interface Class {
	name: string;
	source: string;
	hd: HD;
	proficiency: string[];
	spellcastingAbility?: string;
	casterProgression?: string;
	preparedSpells?: string;
	cantripProgression?: number[];
	optionalfeatureProgression?: OptionalfeatureProgression[];
	startingProficiencies: StartingProficiencies;
	startingEquipment: StartingEquipment;
	multiclassing?: Multiclassing;
	classTableGroups?: ClassTableGroup[];
	classFeatures: Array<ClassFeatureClass | string>;
	subclassTitle?: string;
	srd?: boolean;
	spellsKnownProgression?: number[];
	additionalSpells?: AdditionalSpell[];
	basicRules?: boolean;
	isSidekick?: boolean;
	spellsKnownProgressionFixedByLevel?: SpellsKnownProgressionFixedByLevel;
	spellsKnownProgressionFixed?: number[];
	spellsKnownProgressionFixedAllowLowerLevel?: boolean;
}

export interface AdditionalSpell {
	name: string;
	known: { [key: string]: Known[] };
}

export interface Known {
	choose: string;
}

export interface ClassFeatureClass {
	classFeature: string;
	gainSubclassFeature: boolean;
}

export interface ClassTableGroup {
	colLabels: string[];
	rows?: Array<Array<Row | number | string>>;
	title?: string;
	rowsSpellProgression?: Array<number[]>;
}

export interface Row {
	type: RowType;
	value?: number;
	toRoll?: HD[];
}

export interface HD {
	number: number;
	faces: number;
}

export enum RowType {
	Bonus = 'bonus',
	BonusSpeed = 'bonusSpeed',
	Dice = 'dice',
}

export interface Roll {
	exact: number;
}

export interface Multiclassing {
	requirements: Requirements;
	proficienciesGained?: ProficienciesGained;
}

export interface ProficienciesGained {
	armor?: Array<{ proficiency: string } | string>;
	tools?: string[];
	weapons?: WeaponEnum[];
	skills?: ProficienciesGainedSkill[];
}

export interface ProficienciesGainedSkill {
	choose: Choose;
}

export interface Choose {
	from: string[];
	count: number;
}

export enum WeaponEnum {
	ItemShortswordPhbShortswords = '{@item shortsword|phb|shortswords}',
	Martial = 'martial',
	Simple = 'simple',
}

export interface Requirements {
	int?: number;
	str?: number;
	cha?: number;
	wis?: number;
	or?: Or[];
	dex?: number;
}

export interface Or {
	str: number;
	dex: number;
}

export interface OptionalfeatureProgression {
	name: string;
	featureType: string[];
	progression: number[];
}

export interface StartingEquipment {
	goldAlternative: string;
	defaultData: DefaultDatum[];
}

export interface DefaultDatum {
	a?: Array<{ equipmentType?: string; quantity?: number; item?: string } | string>;
	b?: Array<{ equipmentType?: string; quantity?: number; item?: string } | string>;
	c?: Array<{ equipmentType: string } | string>;
	_?: Array<{ equipmentType?: string; quantity?: number; item?: string } | string>;
}

export interface StartingProficiencies {
	armor?: Array<{ proficiency: string } | string>;
	weapons: Array<WeaponClass | string>;
	tools?: string[];
	skills: StartingProficienciesSkill[];
}

export interface StartingProficienciesSkill {
	choose?: Choose;
	any?: number;
}

export interface WeaponClass {
	proficiency: string;
	optional: boolean;
}

export interface SpellsKnownProgressionFixedByLevel {
	'11': { '6': number };
	'13': { '7': number };
	'15': { '8': number };
	'17': { '9': number };
}
