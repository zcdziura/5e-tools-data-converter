import {
	Class as InputClass,
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
	options: EquipmentChoice[];
}

interface EquipmentChoice {
	name: string;
	amount?: number;
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

function convertStartingEquipment(startingEquipment: InputStartingEquipment): StartingEquipment {}
