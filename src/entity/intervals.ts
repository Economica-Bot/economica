import { Column, Entity, JoinColumn, OneToOne, Relation } from 'typeorm';
import { defaultIntervalsObj } from '../typings';
import { Guild } from './guild';

@Entity()
export class Intervals {
	@OneToOne(() => Guild, (guild) => guild.intervals, { primary: true })
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
