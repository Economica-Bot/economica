import { ColorResolvable } from 'discord.js';

import { ReplyString, Incomes, Intervals, Module, ModuleString, ListingString } from './index.js';

export const defaultIntervalsObj: Intervals = {
	minutely: {
		amount: 50,
		cooldown: 1000 * 60,
		enabled: true,
	},
	hourly: {
		amount: 500,
		cooldown: 1000 * 60 * 60,
		enabled: true,
	},
	daily: {
		amount: 5_000,
		cooldown: 1000 * 60 * 60 * 24,
		enabled: true,
	},
	weekly: {
		amount: 50_000,
		cooldown: 1000 * 60 * 60 * 24 * 7,
		enabled: true,
	},
	fortnightly: {
		amount: 125_000,
		cooldown: 1000 * 60 * 60 * 24 * 7 * 2,
		enabled: true,
	},
	monthly: {
		amount: 300_000,
		cooldown: 1000 * 60 * 60 * 24 * 7 * 4,
		enabled: true,
	},
};

export const defaultIncomesObj: Incomes = {
	work: {
		min: 100,
		max: 500,
		cooldown: 1000 * 30,
	},
	beg: {
		min: 25,
		max: 125,
		chance: 40,
		cooldown: 1000 * 30,
	},
	crime: {
		min: 300,
		max: 1500,
		chance: 60,
		minfine: 300,
		maxfine: 1500,
		cooldown: 1000 * 60,
	},
	rob: {
		chance: 20,
		minfine: 500,
		maxfine: 2000,
		cooldown: 1000 * 60,
	},
};

export const defaultModulesObj: Record<ModuleString, Module> = {
	ADMIN: {
		type: 'DEFAULT',
		enabled: true,
		user: null,
	},
	CASINO: {
		type: 'SPECIAL',
		enabled: false,
		user: null,
	},
	ECONOMY: {
		type: 'DEFAULT',
		enabled: true,
		user: null,
	},
	INCOME: {
		type: 'DEFAULT',
		enabled: true,
		user: null,
	},
	INSIGHTS: {
		type: 'SPECIAL',
		enabled: false,
		user: null,
	},
	INTERVAL: {
		type: 'SPECIAL',
		enabled: false,
		user: null,
	},
	MODERATION: {
		type: 'DEFAULT',
		enabled: true,
		user: null,
	},
	SHOP: {
		type: 'DEFAULT',
		enabled: true,
		user: null,
	},
	UTILITY: {
		type: 'DEFAULT',
		enabled: true,
		user: null,
	},
};

export const EmbedColors: Record<ReplyString, ColorResolvable> = {
	success: 'Green',
	info: 'Blurple',
	warn: 'Yellow',
	error: 'Red',
};
export enum Emojis {
	APPLE = '<a:apple:975152086700408842>',
	ARMOR_CHESTPLATE = '<:armor_chestplate:974903632665407518>',
	ARMOR_HELMET = '<:armor_helmet:974903634301169724>',
	ARTIFACT = '<:artifact:974903633445543946>',
	AWARD = '<:award:974903642022883388>',
	BACKPACK = '<:backpack:974903636025040906>',
	BLACK_HOLE = '<:black_hole:974903635190358026>',
	BLUE_RESET_ARROWS = '<:blue_reset_arrows:974903637065220126>',
	BOX = '<a:box:975152086843027536>',
	BRONZE = '<:bronze:974903639166578718>',
	BULLET = '<:bullet:974903637795045397>',
	CAMPFIRE = '<:campfire:974903640877858826>',
	CANCEL = '<:cancel:974903639938306058>',
	CHAINSAW = '<:chainsaw:974903642840784896>',
	CHAINSAW_MASK = '<:chainsaw_mask:974903643805474846>',
	CHECK = '<:check:974903644724006942>',
	CHEESE_BLOCK = '<:cheese_block:974903652106010654>',
	CHEST = '<:chest:974903645709672478>',
	COG = '<:cog:974903646531764284>',
	COGS = '<:cogs:974903647358046228>',
	COIN = '<a:coin:975152086708781066>',
	COLLECTABLE = '<:collectable:974924859895336971>',
	COMMON_CHEST = '<a:common_chest:975152086721396816>',
	CONFIRM = '<:confirm:974903647840391220>',
	CONTROLS = '<:controls:974903648972841011>',
	CPU = '<:cpu:974903649979498526>',
	CREDIT = '<:credit:974903650772221984>',
	CROSS = '<:cross:974903653087445012>',
	DEED = '<:deed:974903653968248852>',
	DIAMOND = '<:diamond:974903654874222633>',
	DISAPPEARING_RING = '<a:disappearing_ring:975152087182770286>',
	DRUMSTICK = '<:drumstick:974903655817969704>',
	ECON_DOLLAR = '<:econ_dollar:974903657646686209>',
	EMERALD = '<:emerald:974903656786833408>',
	EXPLOSIVE = '<:explosive:974903663178948659>',
	EYE_OF_AETHER = '<:eye_of_aether:974903659563450410>',
	FLAME = '<:flame:974903660914044978>',
	FOCUS = '<:focus:974903668769980519>',
	FOREIGN_COIN = '<:foreign_coin:974903662323322880>',
	FUTURE_CUBE = '<:future_cube:974903664093315072>',
	GAMBLING_DIE = '<:gambling_die:974903666945437726>',
	GEM = '<a:gem:975152086935277648>',
	GENERATOR = '<:generator:990007141320523827>',
	GLOBAL = '<:global:974903665020239893>',
	GLOBAL_NOT = '<:global_not:974903666001707048>',
	GLOBE = '<:globe:974903667679428651>',
	GOLD = '<:gold:974903670351204372>',
	GOLD_COIN_STACK = '<:gold_coin_stack:974903672846843974>',
	GREEN_PLUS = '<:green_plus:974903671177498635>',
	GREEN_UP_ARROW = '<:green_up_arrow:974903672007950346>',
	ICON_1 = '<:icon_1:974903674868498482>',
	ICON_2 = '<:icon_2:974903675891879997>',
	ICON_3 = '<:icon_3:974903677087281222>',
	ICON_4 = '<:icon_4:974903678920196157>',
	ICON_5 = '<:icon_5:974903678018404372>',
	ICON_6 = '<:icon_6:974903680925069372>',
	ICON_7 = '<:icon_7:974903680027484210>',
	ICON_8 = '<:icon_8:974924857865277480>',
	INSTRUMENT_FLUTE = '<:instrument_flute:974924862395125771>',
	INSTRUMENT_HARP = '<:instrument_harp:974924864152547389>',
	INSTRUMENT_TRUMPET = '<:instrument_trumpet:974924861447221268>',
	INSTRUMENT_VIOLIN = '<:instrument_violin:974924866430050314>',
	KEY = '<a:key:975152086436163615>',
	LEGENDARY_CHEST = '<a:legendary_chest:975152086822035546>',
	LEVELS_4 = '<:levels_4:974924865280815186>',
	MAGIC_ORE = '<a:magic_ore:975152087014973450>',
	MAGIC_POTION = '<a:magic_potion:975152087371497562>',
	MAIL = '<:mail:974924867638001694>',
	MENU = '<:menu:974924868711751721>',
	MONEY_BAG = '<:money_bag:974924869705826334>',
	MONEY_BRIEFCASE = '<:money_briefcase:974924871698100255>',
	MONEY_STACK = '<:money_stack:974924872918638602>',
	NETWORK = '<:network:974924870632734731>',
	NEXT = '<:next:975487429517672520>',
	NOTIFICATION = '<:notification:974924874093051924>',
	OIL = '<:oil:974924875120672810>',
	PAPER_TOWEL = '<:paper_towel:974924876508975135>',
	PERSON_ADD = '<:person_add:974924878786494534>',
	PERSON_REMOVE = '<:person_remove:974924877666611212>',
	PETROL = '<:petrol:974924879616950342>',
	POTION_AMBER = '<:potion_amber:974924880472584192>',
	POTION_BLUE = '<:potion_blue:974924882708164608>',
	POTION_GREEN = '<:potion_green:974924883454742579>',
	PREVIOUS = '<:previous:975487443656642620>',
	RAM = '<:ram:974924881324032010>',
	RARE_CHEST = '<a:rare_chest:975152086817865819>',
	RED_DOWN_ARROW = '<:red_down_arrow:974924884486524959>',
	RED_MINUS = '<:red_minus:974924885702897674>',
	RELOAD = '<:reload:974924887808434216>',
	RETURN = '<:return:974924890715095040>',
	REVERT = '<:revert:974924886680150017>',
	RIFLE = '<:rifle:974924889372901400>',
	SAPPHIRE = '<:sapphire:974924888668258345>',
	SHIELD = '<:shield:974924891704938527>',
	SKULL = '<:skull:974924894322184242>',
	SLIME_DIAMOND = '<:slime_diamond:974924892585721906>',
	STACK = '<:stack:974924893412012072>',
	STAR_LEVEL_5 = '<:star_level_5:974924894808715275>',
	STAR_LEVEL_FOUR = '<:star_level_four:974924896092192838>',
	STAR_LEVEL_ONE = '<:star_level_one:974924897111384125>',
	STAR_LEVEL_THREE = '<:star_level_three:974924900143890442>',
	STAR_LEVEL_TWO = '<:star_level_two:974924897950261259>',
	STONE = '<:stone:989719975654752266>',
	SUNGLASSES = '<:sunglasses:974924898923339797>',
	TEXTING = '<a:texting:975152086893346866>',
	TILES = '<:tiles:974924901494452234>',
	TIME = '<:time:974924903570604092>',
	PICKAXE = '<:pickaxe:989967644037885994>',
	TREND = '<a:trend:975152087660896286>',
	TRIANGLE_DOWN = '<:triangle_down:974924906414346250>',
	TRIANGLE_UP = '<:triangle_up:974924907400036374>',
	UFO = '<:ufo:974924908138229762>',
	UNKNOWN = '<a:unknown:975152087115661372>',
	UNLOCK = '<a:unlock:975152087384068096>',
	URANIUM = '<:uranium:975152152198660248>',
	WOOD = '<:wood:974924909383917568>',
}
export const INTERACTION_COMPONENT_COOLDOWN = 1000 * 45;
export enum Properties {
	TEXTILE_MILL = 'MANUFACTURING',
	OIL_REFINERY = 'MANUFACTURING',
	PLASTIC_FACTORY = 'MANUFACTURING',
	LUMBER_PLANT = 'MANUFACTURING',
	SUPERMARKET = 'RETAIL',
	WAREHOUSE_STORE = 'RETAIL',
	MALL = 'RETAIL',
	ORCHARD = 'AGRICULTURE',
	HYDROPONIC_FARM = 'AGRICULTURE',
	TRADITIONAL_FARM = 'AGRICULTURE',
	LIVESTOCK = 'AGRICULTURE',
	BULLDOZER = 'CONSTRUCTION',
	FRONT_LOADER = 'CONSTRUCTION',
	DUMP_TRUCK = 'CONSTRUCTION',
	BACKHOE = 'CONSTRUCTION',
	TRENCHER = 'CONSTRUCTION',
	CRANE = 'CONSTRUCTION',
	PRESCHOOL = 'EDUCATION',
	KINDERGARTEN = 'EDUCATION',
	ELEMENTARY_SCHOOL = 'EDUCATION',
	INTERMEDIATE_SCHOOL = 'EDUCATION',
	SECONDARY_SCHOOL = 'EDUCATION',
	COLLEGE = 'EDUCATION',
	UNIVERSITY = 'EDUCATION',
	PHONE_ASSEMBLY_LINE = 'TECHNOLOGY',
	COMPUTER_ASSEMBLY_LINE = 'TECHNOLOGY',
	TABLET_ASSEMBLY_LINE = 'TECHNOLOGY',
	COMPACT_CAR = 'TRANSPORATION',
	BUS = 'TRANSPORATION',
	STEAM_LOCOMOTIVE = 'TRANSPORATION',
	DIESEL_LOCOMOTIVE = 'TRANSPORATION',
	ELECTRIC_LOCOMOTIVE = 'TRANSPORATION',
	CESSNA = 'TRANSPORATION',
	JUMBO_JET = 'TRANSPORATION',
}
export type PropertyString = `${Properties}`;
export type IndustryString = keyof typeof Properties;
export interface RouletteBet {
	type: 'Inside' | 'Outside';
	formatted: RouletteBetsFormattedType;
	description: RouletteBetsDescriptionsType;
}
export type RouletteBetsNamesType =
	| 'single'
	| 'split'
	| 'street'
	| 'corner'
	| 'double_street'
	| 'trio'
	| 'first_four'
	| 'half'
	| 'color'
	| 'even_or_odd'
	| 'dozen'
	| 'snake'
	| 'column';
export type RouletteBetsFormattedType =
	| 'Single'
	| 'Split'
	| 'Street'
	| 'Corner'
	| 'Double Street'
	| 'Trio'
	| 'First Four'
	| 'Half'
	| 'Color'
	| 'Even or Odd'
	| 'Dozen'
	| 'Column'
	| 'Snake';
export type RouletteBetsDescriptionsType =
	| 'Bet on a single number'
	| 'Bet on two distinct vertically/horizontally adjacent numbers'
	| 'Bet on three distinct consecutive numbers in a horizontal line'
	| 'Bet on four numbers that meet at one corner'
	| 'Bet on six consecutive numbers that form two horizontal lines'
	| 'A three-number bet that involves at least one zero'
	| 'Bet on 0-1-2-3'
	| 'A bet that the number will be in the chosen range'
	| 'A bet that the number will be the chosen color'
	| 'A bet that the number will be of the chosen type'
	| 'A bet that the number will be in the chosen dozen'
	| 'A bet that the number will be in the chosen vertical column'
	| 'A special bet that covers the numbers 1, 5, 9, 12, 13, 16, 19, 23, 27, 30, 32, and 34';
export const RouletteBets: Record<RouletteBetsNamesType, RouletteBet> = {
	single: {
		type: 'Inside',
		formatted: 'Single',
		description: 'Bet on a single number',
	},
	split: {
		type: 'Inside',
		formatted: 'Split',
		description: 'Bet on two distinct vertically/horizontally adjacent numbers',
	},
	street: {
		type: 'Inside',
		formatted: 'Street',
		description: 'Bet on three distinct consecutive numbers in a horizontal line',
	},
	corner: {
		type: 'Inside',
		formatted: 'Corner',
		description: 'Bet on four numbers that meet at one corner',
	},
	double_street: {
		type: 'Inside',
		formatted: 'Double Street',
		description: 'Bet on six consecutive numbers that form two horizontal lines',
	},
	trio: {
		type: 'Inside',
		formatted: 'Trio',
		description: 'A three-number bet that involves at least one zero',
	},
	first_four: {
		type: 'Inside',
		formatted: 'First Four',
		description: 'Bet on 0-1-2-3',
	},
	half: {
		type: 'Outside',
		formatted: 'Half',
		description: 'A bet that the number will be in the chosen range',
	},
	color: {
		type: 'Outside',
		formatted: 'Color',
		description: 'A bet that the number will be the chosen color',
	},
	even_or_odd: {
		type: 'Outside',
		formatted: 'Even or Odd',
		description: 'A bet that the number will be of the chosen type',
	},
	dozen: {
		type: 'Outside',
		formatted: 'Dozen',
		description: 'A bet that the number will be in the chosen dozen',
	},
	column: {
		type: 'Outside',
		formatted: 'Column',
		description: 'A bet that the number will be in the chosen vertical column',
	},
	snake: {
		type: 'Outside',
		formatted: 'Snake',
		description: 'A special bet that covers the numbers 1, 5, 9, 12, 13, 16, 19, 23, 27, 30, 32, and 34',
	},
};
export const PAGINATION_LIMIT = 5;
