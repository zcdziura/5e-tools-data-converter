export interface OptionalFeature {
	name: string;
	source: string;
	page: number;
	featureType: FeatureType[];
	entries: Array<EntryClass | string>;
	srd?: boolean;
	prerequisite?: Prerequisite[];
	isClassFeatureVariant?: boolean;
	consumes?: Consumes;
	otherSources?: OtherSource[];
	additionalSpells?: AdditionalSpell[];
	previousVersion?: PreviousVersion;
	skillProficiencies?: SkillProficiency[];
}

export interface AdditionalSpell {
	innate?: Innate;
	ability?: string;
	known?: Known;
	resourceName?: ResourceName;
}

export interface Innate {
	_: string[] | Empty;
}

export interface Empty {
	daily?: Daily;
	ritual?: Array<Element | string>;
	resource?: { [key: string]: string[] };
}

export interface Daily {
	'1e': string[];
}

export interface Element {
	choose: string;
	count: number;
}

export interface Known {
	_: Element[];
}

export enum ResourceName {
	Ki = 'Ki',
}

export interface Consumes {
	name: Name;
}

export enum Name {
	Artificer = 'Artificer',
	ArtificerRevisited = 'Artificer (Revisited)',
	Fighter = 'Fighter',
	FourElements = 'Four Elements',
	Monk = 'Monk',
	RuneKnight = 'Rune Knight',
	SuperiorityDice = 'Superiority Dice',
	Warlock = 'Warlock',
}

export interface EntryClass {
	type: Type;
	items?: string[];
	caption?: string;
	colLabels?: ColLabel[];
	colStyles?: string[];
	rows?: Array<string[]>;
}

export enum ColLabel {
	Attunement = 'Attunement',
	MagicItem = 'Magic Item',
}

export enum Type {
	List = 'list',
	Table = 'table',
}

export enum FeatureType {
	AF = 'AF',
	AI = 'AI',
	As = 'AS',
	AsV1Ua = 'AS:V1-UA',
	AsV2Ua = 'AS:V2-UA',
	Ed = 'ED',
	Ei = 'EI',
	FSB = 'FS:B',
	FSF = 'FS:F',
	FSP = 'FS:P',
	FSR = 'FS:R',
	Mm = 'MM',
	MvB = 'MV:B',
	MvC2Ua = 'MV:C2-UA',
	Or = 'OR',
	Pb = 'PB',
	Rn = 'RN',
}

export interface OtherSource {
	source: OtherSourceSource;
	page: number;
}

export enum OtherSourceSource {
	Erlw = 'ERLW',
	Phb = 'PHB',
	UARevisedSubclasses = 'UARevisedSubclasses',
	UATheRangerRevised = 'UATheRangerRevised',
	Xge = 'XGE',
}

export interface Prerequisite {
	spell?: Spell[];
	pact?: Pact;
	level?: Level;
	item?: string[];
	patron?: string;
	otherSummary?: OtherSummary;
}

export interface Level {
	level: number;
	class: Consumes;
	subclass?: Consumes;
}

export interface OtherSummary {
	entry: string;
	entrySummary: string;
}

export enum Pact {
	Blade = 'Blade',
	Chain = 'Chain',
	Talisman = 'Talisman',
	Tome = 'Tome',
}

export enum Spell {
	EldritchBlastC = 'eldritch blast#c',
	HexCurseX = 'hex/curse#x',
}

export interface PreviousVersion {
	name: string;
	source: PreviousVersionSource;
}

export enum PreviousVersionSource {
	UAWarlockAndWizard = 'UAWarlockAndWizard',
}

export interface SkillProficiency {
	deception: boolean;
	persuasion?: boolean;
	stealth?: boolean;
}
