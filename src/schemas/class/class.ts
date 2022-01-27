// deno-lint-ignore-file no-case-declarations
import { OptionalFeature } from '../optional-features/optional-feature.ts';
import { ClassFeature, EntryObjectType, Source, SubEntryObject } from './input/class-feature.ts';
import {
	Class as InputClass,
	ClassTableGroup,
	HD,
	SpellsKnownProgressionFixedByLevel,
	StartingEquipment as InputStartingEquipment,
	StartingProficienciesSkill,
	WeaponClass,
} from './input/class.ts';

const SPECIAL_HYPERTEXT_REGEX = /\{\@\w+\s([\s'\-\/0-9A-Za-z]+)(?:\|(?:[\s!&'\-.=/0-9:;A-Z\[\]a-z\|])+)?\}/g;

export class Class {
	public name: string;
	public source: string;
	public hitDie: HitDie;
	public proficiencies: Proficiencies;
	public startingEquipment: StartingEquipment;
	public features: Feature[];
	public spellcasting?: Spellcasting;

	constructor(inputClass: InputClass, classFeatures: ClassFeature[], optionalFeatures: Map<string, OptionalFeature>) {
		this.name = inputClass.name;
		this.source = inputClass?.srd ? 'SRD' : inputClass.source;
		this.hitDie = convertHitDie(inputClass.hd);
		this.proficiencies = {
			armor: convertArmor(inputClass.startingProficiencies.armor),
			savingThrows: convertSavingThrows(inputClass.proficiency),
			skills: convertSkillProficiencies(inputClass.startingProficiencies.skills),
			tools: convertToolProficiencies(inputClass.startingProficiencies?.tools),
			weapons: convertWeaponProficiencies(inputClass.startingProficiencies?.weapons),
		};

		this.startingEquipment = convertStartingEquipment(inputClass.startingEquipment);
		this.features = convertClassFeatures(inputClass.name, classFeatures, optionalFeatures);
		this.spellcasting = convertSpellcasting(
			inputClass.casterProgression,
			inputClass.spellcastingAbility,
			inputClass.cantripProgression,
			inputClass.spellsKnownProgression,
			inputClass.spellsKnownProgressionFixedByLevel,
			inputClass.preparedSpells,
			inputClass.classTableGroups
		);
	}
}

enum HitDie {
	D6 = 'D6',
	D8 = 'D8',
	D10 = 'D10',
	D12 = 'D12',
}

interface Proficiencies {
	armor?: Array<ArmorCategory>;
	savingThrows: AbilityScore[];
	skills: SkillProficiency;
	tools?: Array<string | { count: number; options: string[] }>;
	weapons?: string[];
}

enum ArmorCategory {
	Light = '$ARMOR_LIGHT',
	Medium = '$ARMOR_MEDIUM',
	Heavy = '$ARMOR_HEAVY',
	Shields = '$ARMOR_SHIELD',
}

enum AbilityScore {
	Str = 'Str',
	Dex = 'Dex',
	Con = 'Con',
	Int = 'Int',
	Wis = 'Wis',
	Cha = 'Cha',
}

interface SkillProficiency {
	count: number;
	options: string[];
}

interface StartingEquipment {
	innate: EquipmentChoice[];
	options: EquipmentChoice[][][];
}

interface EquipmentChoice {
	name: string;
	amount: number;
}

interface Spellcasting {
	ability: string;
	spellSlots: SpellSlotsByLevel[];
	cantripsKnown?: number[];
	spellsKnown?: number[];
	spellsPrepared?: SpellsPreparedFormula;
}

class SpellSlotsByLevel {
	'1st': number;
	'2nd': number;
	'3rd': number;
	'4th': number;
	'5th': number;
	'6th': number;
	'7th': number;
	'8th': number;
	'9th': number;

	constructor() {
		this['1st'] = 0;
		this['2nd'] = 0;
		this['3rd'] = 0;
		this['4th'] = 0;
		this['5th'] = 0;
		this['6th'] = 0;
		this['7th'] = 0;
		this['8th'] = 0;
		this['9th'] = 0;
	}

	withSpellSlot(slot: number, amount: number): SpellSlotsByLevel {
		let key: string;
		switch (slot) {
			case 1:
				key = '1st';
				break;

			case 2:
				key = '2nd';
				break;

			case 3:
				key = '3rd';
				break;

			case 4:
				key = '4th';
				break;

			case 5:
				key = '5th';
				break;

			case 6:
				key = '6th';
				break;

			case 7:
				key = '7th';
				break;

			case 8:
				key = '8th';
				break;

			case 9:
				key = '9th';
				break;

			default:
				return this;
		}

		// deno-lint-ignore no-explicit-any
		(this as any)[key] = amount;
		return this;
	}
}

enum SpellsPreparedFormula {
	Full = '$SPELL_PREP_FULL_LEVEL',
	Half = '$SPELL_PREP_HALF_LEVEL',
}

interface Feature {
	name: string;
	level: number;
	source: string;
	description: string;
	optional?: boolean;
}

function convertHitDie(hd: HD): HitDie {
	switch (hd.faces) {
		case 6:
			return HitDie.D6;

		case 10:
			return HitDie.D10;

		case 12:
			return HitDie.D12;

		default:
			return HitDie.D8;
	}
}

function convertArmor(armor?: Array<{ proficiency: string } | string>): Array<ArmorCategory> | undefined {
	return armor?.map(entry => {
		if (typeof entry === 'string') {
			return mapArmorEnum(entry);
		} else {
			return mapArmorEnum(entry.proficiency);
		}
	});
}

function mapArmorEnum(value: string): ArmorCategory {
	switch (value.toLowerCase()) {
		case 'light':
			return ArmorCategory.Light;

		case 'medium':
			return ArmorCategory.Medium;

		case 'heavy':
			return ArmorCategory.Heavy;

		default:
			return ArmorCategory.Shields;
	}
}

function convertSavingThrows(savingThrows: string[]): AbilityScore[] {
	return savingThrows.map(abilityScore => {
		switch (abilityScore.toLowerCase()) {
			case 'str':
				return AbilityScore.Str;

			case 'dex':
				return AbilityScore.Dex;

			case 'con':
				return AbilityScore.Con;

			case 'int':
				return AbilityScore.Int;

			case 'wis':
				return AbilityScore.Wis;

			default:
				return AbilityScore.Cha;
		}
	});
}

function convertSkillProficiencies(skillProficiencies: StartingProficienciesSkill[]): SkillProficiency {
	const newProficiency: SkillProficiency = {
		count: 0,
		options: [],
	};

	skillProficiencies.forEach(prof => {
		if (prof.any) {
			newProficiency.count += prof.any;
			newProficiency.options.push('$SKILLS_ALL');
		} else {
			newProficiency.count += prof.choose!.count;
			newProficiency.options.push(
				...prof.choose!.from.map(option =>
					option
						.split(' ')
						.map(str => {
							if (str === 'of') {
								return str;
							} else {
								return `${str.substring(0, 1).toUpperCase()}${str.substring(1)}`;
							}
						})
						.join(' ')
				)
			);
		}
	});

	return newProficiency;
}

function convertToolProficiencies(
	toolProficiencies?: string[]
): Array<string | { count: number; options: string[] }> | undefined {
	if (toolProficiencies) {
		const RE = /\{@\w+\s((?:\w+\'?\s?)+)/;
		return toolProficiencies!.map(prof => {
			if (prof === "one type of {@item artisan's tools|PHB} of your choice") {
				return {
					count: 1,
					options: ['$TOOL_ARTISAN'],
				};
			} else if (prof === 'three {@item musical instrument|PHB|musical instruments} of your choice') {
				return {
					count: 3,
					options: ['$TOOL_INSTRUMENT'],
				};
			} else if (
				prof ===
				"any one type of {@item artisan's tools|PHB} or any one {@item musical instrument|PHB} of your choice"
			) {
				return {
					count: 1,
					options: ['$TOOL_ARTISAN', '$TOOL_INSTRUMENT'],
				};
			} else {
				return prof.match(RE)![1];
			}
		});
	}
}

function convertWeaponProficiencies(weaponProficiencies?: Array<WeaponClass | string>): string[] | undefined {
	if (weaponProficiencies) {
		const RE = /\{@\w+\s((?:\w+\'?\s?)+)/;
		return weaponProficiencies.map(prof => {
			if (typeof prof === 'string') {
				switch (prof) {
					case 'simple':
						return '$WEAPON_SIMPLE';

					case 'martial':
						return '$WEAPON_MARTIAL';

					default:
						return prof.match(RE)![1];
				}
			} else {
				return '$WEAPON_FIREARM';
			}
		});
	}
}

function convertStartingEquipment(startingEquipment: InputStartingEquipment): StartingEquipment {
	const innate: EquipmentChoice[] = [];
	const options: EquipmentChoice[][][] = [];

	for (const entry of startingEquipment.defaultData) {
		if (entry['_']) {
			for (const i of entry['_']!) {
				if (typeof i === 'string') {
					const innateEntry = i as string;
					const nameAndAmount = innateEntry.split('|')[0].toLowerCase();
					const name = nameAndAmount.match(/((?:\w+'?\s?)+)/)![1].trim();
					const amount = nameAndAmount.includes('(') ? parseInt(nameAndAmount.match(/(\d+)/)![1]) : 1;

					innate.push({
						name,
						amount,
					});
				} else {
					const innateEntry = i as {
						equipmentType?: string;
						quantity?: number;
						item?: string;
					};
					const itemKey = 'equipmentType' in innateEntry ? 'equipmentType' : 'item';
					switch (innateEntry[itemKey]!) {
						case 'weaponSimple':
							innate.push({
								name: '$WEAPON_SIMPLE',
								amount: innateEntry.quantity ?? 1,
							});
							break;

						case 'weaponSimpleMelee':
							innate.push({
								name: '$WEAPON_SIMPLE_MELEE',
								amount: innateEntry.quantity ?? 1,
							});
							break;

						case 'weaponMartial':
							innate.push({
								name: '$WEAPON_MARTIAL',
								amount: innateEntry.quantity ?? 1,
							});
							break;

						default:
							const nameAndAmount = innateEntry[itemKey]!.split('|')[0].toLowerCase();
							const name = nameAndAmount.match(/((?:\w+'?\s?)+)/)![1].trim();
							const amount = nameAndAmount.includes('(')
								? parseInt(nameAndAmount.match(/(\d+)/)![1])
								: innateEntry.quantity ?? 1;
							innate.push({
								name,
								amount: amount,
							});
							break;
					}
				}
			}
		} else {
			const row = Object.values(entry).map(v => {
				const values = v as Array<{ equipmentType?: string; quantity?: number; item?: string } | string>;
				return values.map(item => {
					if (typeof item === 'string') {
						const nameAndAmount = item.split('|')[0].toLowerCase();
						const name = nameAndAmount.match(/((?:\w+'?\s?)+)/)![1].trim();
						const amount = nameAndAmount.includes('(') ? parseInt(nameAndAmount.match(/(\d+)/)![1]) : 1;

						return {
							name,
							amount,
						};
					} else {
						if (item.equipmentType) {
							switch (item.equipmentType!) {
								case 'weaponSimple':
									return {
										name: '$WEAPON_SIMPLE',
										amount: item.quantity ?? 1,
									};

								case 'weaponSimpleMelee':
									return {
										name: '$WEAPON_SIMPLE_MELEE',
										amount: item.quantity ?? 1,
									};

								case 'weaponMartial':
									return {
										name: '$WEAPON_MARTIAL',
										amount: item.quantity ?? 1,
									};

								case 'weaponMartialMelee':
									return {
										name: '$WEAPON_MARTIAL_MELEE',
										amount: item.quantity ?? 1,
									};

								default:
									return {
										name: item.equipmentType!.split('|')[0].toLowerCase(),
										amount: item.quantity ?? 1,
									};
							}
						} else {
							const nameAndAmount = item.item!.split('|')[0].toLowerCase();
							const name = nameAndAmount.match(/((?:\w+'?\s?)+)/)![1].trim();
							const amount = nameAndAmount.includes('(') ? parseInt(nameAndAmount.match(/(\d+)/)![1]) : 1;

							return {
								name,
								amount,
							};
						}
					}
				});
			});

			options.push(row);
		}
	}

	return {
		innate,
		options,
	};
}

function convertClassFeatures(
	_className: string,
	classFeatures: ClassFeature[],
	optionalFeatures: Map<string, OptionalFeature>
): Feature[] {
	return classFeatures.map(feature => {
		const source = feature.srd ? 'SRD' : feature.source === Source.Tce ? 'TCE' : 'PHB';
		const description = feature.entries
			.filter(entry => {
				if (typeof entry !== 'string') {
					return (
						entry.type !== EntryObjectType.Inset &&
						entry.type !== EntryObjectType.AbilityDc &&
						entry.type !== EntryObjectType.AbilityAttackMod &&
						entry.type !== EntryObjectType.RefClassFeature
					);
				}

				return entry.substring(0, 2) !== '{@' && entry.substring(entry.length - 2) !== '}}';
			})
			.map(entry => {
				if (typeof entry === 'string') {
					return entry.replaceAll('\u2014', '&mdash;').replaceAll(SPECIAL_HYPERTEXT_REGEX, '$1');
				} else if (entry.type === EntryObjectType.List) {
					return entry
						.items!.map((item, idx) => `${idx + 1}. ${item}`)
						.join('\n')
						.replaceAll('\u2014', '&mdash;')
						.replaceAll(SPECIAL_HYPERTEXT_REGEX, '$1')
						.trim();
				} else if (entry.type === EntryObjectType.Table) {
					const tableCaption = `#### ${entry.caption!}`;
					const tabelHeader = `| ${entry.colLabels!.join(' | ')} |`;
					const tableHeaderSeparator = `|${entry.colLabels!.map(_ => ':--:').join('|')}|`;
					const tableBody = entry
						.rows!.map(
							row =>
								`| ${row
									.map(text =>
										text.replaceAll('\u2014', '&mdash;').replaceAll(SPECIAL_HYPERTEXT_REGEX, '$1')
									)
									.join(' | ')} |`
						)
						.join('\n');

					return `${tableCaption}\n${tabelHeader}\n${tableHeaderSeparator}\n${tableBody}`;
				} else if (entry.type === EntryObjectType.Options) {
					return entry
						.entries!.filter(entry => {
							const [_, source] = (entry as SubEntryObject).optionalfeature!.split('|');
							return !source || source.substring(0, 2).toLowerCase() !== 'ua';
						})
						.map(entry => {
							const name = (entry as SubEntryObject).optionalfeature!.split('|')[0];
							const description = optionalFeatures
								.get(name)!
								.entries.map(e => {
									if (typeof e === 'string') {
										return e;
									} else {
										return 'TODO!!';
									}
								})
								.join('\n')
								.replaceAll('\u2014', '&mdash;')
								.replaceAll(SPECIAL_HYPERTEXT_REGEX, '$1');

							return `**${name}.** ${description}`;
						})
						.join('\n');
				} else {
					const title = `### ${entry.name!}`;
					const description = entry.entries
						?.filter(subentry => {
							if (typeof subentry === 'string') {
								return true;
							} else {
								return (
									subentry.type !== EntryObjectType.Inset &&
									subentry.type !== EntryObjectType.AbilityDc &&
									subentry.type !== EntryObjectType.AbilityAttackMod &&
									subentry.type !== EntryObjectType.RefClassFeature
								);
							}
						})
						.map(subentry => {
							if (typeof subentry === 'string') {
								return subentry
									.replaceAll('\u2014', '&mdash;')
									.replaceAll(SPECIAL_HYPERTEXT_REGEX, '$1')
									.trim();
							}

							if (subentry.type === EntryObjectType.Table) {
								const _columnLengths = [subentry.colLabels!]
									.concat(subentry.rows!)
									.map(entry => entry.map(e => e.length + 2))
									.reduce((acc, cur) => {
										const array = [];
										for (let i = 0; i < acc.length; i++) {
											if (cur[i] > acc[i]) {
												array.push(cur[i]);
											} else {
												array.push(acc[i]);
											}
										}

										return array;
									});

								const tableCaption = `#### ${subentry.caption!}`;
								const tabelHeader = `| ${subentry.colLabels!.join(' | ')} |`;
								const tableHeaderSeparator = `|${subentry.colLabels!.map(_ => ':--:').join('|')}|`;
								const tableBody = subentry.rows!.map(row => `| ${row.join(' | ')} |`).join('\n');

								return `${tableCaption}\n${tabelHeader}\n${tableHeaderSeparator}\n${tableBody}`;
							}

							return 'TODO!!';
						})
						.join('\n\n');

					return `${title}\n\n${description}`;
				}
			})
			.join('\n\n')
			.trim();

		return {
			name: feature.name,
			level: feature.level,
			source,
			description,
			optional: feature.isClassFeatureVariant,
		};
	});
}

function convertSpellcasting(
	casterProgression?: string,
	spellcastingAbility?: string,
	cantripProgression?: number[],
	spellsKnownProgression?: number[],
	spellsKnownProgressionFixedByLevel?: SpellsKnownProgressionFixedByLevel,
	preparedSpells?: string,
	classTableGroups?: ClassTableGroup[]
): Spellcasting | undefined {
	if (!casterProgression) {
		return;
	} else if (casterProgression.toLowerCase() === 'pact') {
		return convertPactSpellcasting(
			spellcastingAbility!,
			cantripProgression!,
			spellsKnownProgression!,
			spellsKnownProgressionFixedByLevel!,
			classTableGroups!
		);
	} else if (casterProgression.toLowerCase() === '1/2' || casterProgression.toLowerCase() === 'artificer') {
		return convertHalfSpellcasting(
			spellcastingAbility!,
			classTableGroups!,
			cantripProgression,
			spellsKnownProgression,
			preparedSpells
		);
	} else {
		return convertFullSpellcasting(
			spellcastingAbility!,
			cantripProgression!,
			classTableGroups!,
			spellsKnownProgression
		);
	}
}

function convertPactSpellcasting(
	spellcastingAbility: string,
	cantripProgression: number[],
	spellsKnownProgression: number[],
	spellsKnownProgressionFixedByLevel: SpellsKnownProgressionFixedByLevel,
	classTableGroups: ClassTableGroup[]
): Spellcasting {
	const ability = `${spellcastingAbility![0].toUpperCase()}${spellcastingAbility!.substring(1)}`;
	const cantripsKnown = cantripProgression!;
	const spellsKnown = spellsKnownProgression;

	const spellLevelRegex = /\{\@filter (\d)\w{2}/;
	const spellSlots = classTableGroups.flatMap(group =>
		group.rows!.map(row => {
			const slots = row[2] as number;
			const spellLevel = parseInt((row[3] as string).match(spellLevelRegex)![1]);
			return new SpellSlotsByLevel().withSpellSlot(spellLevel, slots);
		})
	);

	const spellSlotsByLevelFixed = Object.entries(spellsKnownProgressionFixedByLevel).map(([l, e]) => {
		const level = parseInt(l);
		const [spellSlot, amount] = Object.entries(e).map(pair => [parseInt(pair[0]), pair[1] as number])[0];
		return [level, spellSlot, amount];
	});

	for (const [level, spellSlot, amount] of spellSlotsByLevelFixed) {
		spellSlots
			.filter((_, idx) => idx + 1 >= level)
			.forEach(slot => {
				slot = slot.withSpellSlot(spellSlot, amount);
			});
	}

	return {
		ability,
		cantripsKnown,
		spellSlots,
		spellsKnown,
	};
}

function convertHalfSpellcasting(
	spellcastingAbility: string,
	classTableGroups: ClassTableGroup[],
	cantripProgression?: number[],
	spellsKnownProgression?: number[],
	preparedSpells?: string
): Spellcasting {
	const ability = `${spellcastingAbility.substring(0, 1).toUpperCase()}${spellcastingAbility.substring(1)}`;
	const cantripsKnown = cantripProgression ?? undefined;
	const spellsKnown = spellsKnownProgression ?? undefined;
	const spellsPrepared = preparedSpells ? SpellsPreparedFormula.Half : undefined;

	const spellSlots = classTableGroups
		.filter(group => group.title?.toLowerCase() === 'spell slots per spell level')
		.flatMap(group =>
			group.rowsSpellProgression!.map(row => {
				const spellSlots = new SpellSlotsByLevel();
				for (let idx = 0; idx < row.length; idx++) {
					spellSlots.withSpellSlot(idx + 1, row[idx]);
				}

				return spellSlots;
			})
		);

	return {
		ability,
		cantripsKnown,
		spellsKnown,
		spellsPrepared,
		spellSlots,
	};
}

function convertFullSpellcasting(
	spellcastingAbility: string,
	cantripProgression: number[],
	classTableGroups: ClassTableGroup[],
	spellsKnownProgression?: number[]
): Spellcasting {
	const ability = `${spellcastingAbility![0].toUpperCase()}${spellcastingAbility!.substring(1)}`;
	const cantripsKnown = cantripProgression!;
	const spellsPrepared = spellsKnownProgression === undefined ? SpellsPreparedFormula.Full : undefined;
	const spellsKnown = spellsKnownProgression;
	const spellSlots = classTableGroups!
		.filter(group => group.title?.toLowerCase() === 'spell slots per spell level')
		.map(group => group.rowsSpellProgression!)
		.flatMap(spellSlots => {
			return spellSlots.map(spellSlotsAtLevel => {
				let slotsByLevel: SpellSlotsByLevel = new SpellSlotsByLevel();
				for (const idx in spellSlotsAtLevel) {
					slotsByLevel = slotsByLevel.withSpellSlot(parseInt(idx) + 1, spellSlotsAtLevel[idx]);
				}

				return slotsByLevel;
			});
		});

	return {
		ability,
		cantripsKnown,
		spellsKnown,
		spellsPrepared,
		spellSlots,
	};
}
