import { Snowflake, SnowflakeUtil } from 'discord.js';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, Relation } from 'typeorm';

import { defaultIncomesObj } from '../typings/index.js';
import { Guild } from './index.js';

@Entity()
export class Incomes {
	@PrimaryColumn({ default: () => SnowflakeUtil.generate() })
		id: Snowflake;

	@OneToOne(() => Guild, (guild) => guild.incomes)
	@JoinColumn()
		guild: Relation<Guild>;

	@Column({ default: defaultIncomesObj.work.min })
		workMin: number;

	@Column({ default: defaultIncomesObj.work.max })
		workMax: number;

	@Column({ default: defaultIncomesObj.work.cooldown })
		workCooldown: number;

	@Column({ default: defaultIncomesObj.beg.min })
		begMin: number;

	@Column({ default: defaultIncomesObj.beg.max })
		begMax: number;

	@Column({ default: defaultIncomesObj.beg.cooldown })
		begCooldown: number;

	@Column({ default: defaultIncomesObj.beg.chance })
		begChance: number;

	@Column({ default: defaultIncomesObj.crime.min })
		crimeMin: number;

	@Column({ default: defaultIncomesObj.crime.max })
		crimeMax: number;

	@Column({ default: defaultIncomesObj.crime.chance })
		crimeChance: number;

	@Column({ default: defaultIncomesObj.crime.minfine })
		crimeMinFine: number;

	@Column({ default: defaultIncomesObj.crime.maxfine })
		crimeMaxFine: number;

	@Column({ default: defaultIncomesObj.crime.cooldown })
		crimeCooldown: number;

	@Column({ default: defaultIncomesObj.rob.chance })
		robChance: number;

	@Column({ default: defaultIncomesObj.rob.minfine })
		robMinFine: number;

	@Column({ default: defaultIncomesObj.rob.maxfine })
		robMaxFine: number;

	@Column({ default: defaultIncomesObj.rob.cooldown })
		robCooldown: number;
}
