import { Snowflake, SnowflakeUtil } from 'discord.js';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, Relation } from 'typeorm';

import { defaultIntervalsObj } from '../typings/index.js';
import { Guild } from './index.js';

@Entity()
export class Intervals {
	@PrimaryColumn({ default: () => SnowflakeUtil.generate() })
		id: Snowflake;

	@OneToOne(() => Guild, (guild) => guild.intervals)
	@JoinColumn()
		guild: Relation<Guild>;

	@Column({ default: defaultIntervalsObj.minutely.amount, type: 'bigint' })
		minutelyAmount: number;

	@Column({ default: defaultIntervalsObj.minutely.cooldown, type: 'bigint' })
		minutelyCooldown: number;

	@Column({ default: defaultIntervalsObj.hourly.amount, type: 'bigint' })
		hourlyAmount: number;

	@Column({ default: defaultIntervalsObj.hourly.cooldown, type: 'bigint' })
		hourlyCooldown: number;

	@Column({ default: defaultIntervalsObj.daily.amount, type: 'bigint' })
		dailyAmount: number;

	@Column({ default: defaultIntervalsObj.daily.cooldown, type: 'bigint' })
		dailyCooldown: number;

	@Column({ default: defaultIntervalsObj.weekly.amount, type: 'bigint' })
		weeklyAmount: number;

	@Column({ default: defaultIntervalsObj.weekly.cooldown, type: 'bigint' })
		weeklyCooldown: number;

	@Column({ default: defaultIntervalsObj.fortnightly.amount, type: 'bigint' })
		fortnightlyAmount: number;

	@Column({ default: defaultIntervalsObj.fortnightly.cooldown, type: 'bigint' })
		fortnightlyCooldown: number;

	@Column({ default: defaultIntervalsObj.monthly.amount, type: 'bigint' })
		monthlyAmount: number;

	@Column({ default: defaultIntervalsObj.monthly.cooldown, type: 'bigint' })
		monthlyCooldown: number;
}
