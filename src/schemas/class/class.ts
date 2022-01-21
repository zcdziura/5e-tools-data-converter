// deno-lint-ignore-file no-case-declarations
import {
	Class as InputClass,
	ClassFeatureClass,
	ClassTableGroup,
	HD,
	StartingEquipment as InputStartingEquipment,
	StartingProficienciesSkill,
	WeaponClass,
} from './input/class.ts';

export class Class {
	public name: string;
	public source: string;
	public hitDie: HitDie;
	public proficiencies: Proficiencies;
	public startingEquipment: StartingEquipment;
	public spellcasting?: Spellcasting;

	constructor(inputClass: InputClass) {
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
		this.spellcasting = convertSpellcasting(
			inputClass.classFeatures,
			inputClass.spellcastingAbility,
			inputClass.cantripProgression
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
	cantripsKnown: number[];
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
					const innateEntry = i as { equipmentType?: string; quantity?: number; item?: string };
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
							const amount = nameAndAmount.includes('(') ? parseInt(nameAndAmount.match(/(\d+)/)![1]) : 1;
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

function convertSpellcasting(
	classFeatures: Array<ClassFeatureClass | string>,
	spellcastingAbility?: string,
	cantripProgression?: number[],
	classTableGroups?: ClassTableGroup[]
): Spellcasting | undefined {
	const isSpellcastingClass =
		classFeatures
			.filter(feature => typeof feature === 'string')
			.map(feature => (feature as string).split('|')[0])
			.filter(feature => feature.toLowerCase() === 'spellcasting').length > 0;

	if (!isSpellcastingClass) {
		return undefined;
	}

	const ability = `${spellcastingAbility![0].toUpperCase()}${spellcastingAbility!.substring(1)}`;

	const cantripsKnown = cantripProgression!;

	return {
		ability,
		cantripsKnown,
	};
}
